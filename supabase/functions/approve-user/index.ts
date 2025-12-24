import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApproveUserRequest {
  waiting_list_id: string;
}

function generateTemporaryPassword(length: number = 12): string {
  const charset = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join("");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !caller) {
      throw new Error("Invalid token");
    }

    // Check if caller has admin role
    const { data: hasAdminRole } = await supabaseAdmin.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });

    if (!hasAdminRole) {
      throw new Error("Not authorized - admin role required");
    }

    // Get request body
    const { waiting_list_id }: ApproveUserRequest = await req.json();

    if (!waiting_list_id) {
      throw new Error("waiting_list_id is required");
    }

    console.log(`Processing approval for waiting_list_id: ${waiting_list_id}`);

    // Get waiting list entry
    const { data: waitingEntry, error: fetchError } = await supabaseAdmin
      .from("waiting_list")
      .select("*")
      .eq("id", waiting_list_id)
      .single();

    if (fetchError || !waitingEntry) {
      throw new Error("Waiting list entry not found");
    }

    if (waitingEntry.status !== "pending") {
      throw new Error(`Entry already processed with status: ${waitingEntry.status}`);
    }

    if (!waitingEntry.first_name || !waitingEntry.last_name || !waitingEntry.email) {
      throw new Error("Missing required user data (name or email)");
    }

    console.log(`Creating user for: ${waitingEntry.email}`);

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();

    // Create user in Supabase Auth
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: waitingEntry.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        first_name: waitingEntry.first_name,
        last_name: waitingEntry.last_name,
        full_name: `${waitingEntry.first_name} ${waitingEntry.last_name}`,
      },
    });

    if (createUserError) {
      console.error("Error creating user:", createUserError);
      throw new Error(`Failed to create user: ${createUserError.message}`);
    }

    console.log(`User created with ID: ${newUser.user.id}`);

    // Find the corresponding plan
    let planId = null;
    if (waitingEntry.selected_distance && waitingEntry.selected_difficulty) {
      const { data: plan } = await supabaseAdmin
        .from("plans")
        .select("id")
        .eq("distance", waitingEntry.selected_distance)
        .eq("difficulty", waitingEntry.selected_difficulty)
        .maybeSingle();
      
      if (plan) {
        planId = plan.id;
        console.log(`Found plan: ${planId}`);
      }
    }

    // Wait for trigger to create profile
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update user profile with additional data
    const { error: updateProfileError } = await supabaseAdmin
      .from("user_profiles")
      .update({
        rut: waitingEntry.rut,
        first_name: waitingEntry.first_name,
        last_name: waitingEntry.last_name,
        distance: waitingEntry.selected_distance,
        difficulty: waitingEntry.selected_difficulty,
        current_plan_id: planId,
        is_first_login: true,
        start_date: new Date().toISOString().split("T")[0],
      })
      .eq("id", newUser.user.id);

    if (updateProfileError) {
      console.error("Error updating profile:", updateProfileError);
    }

    // Mark waiting list entry as approved
    const { error: updateWaitingError } = await supabaseAdmin
      .from("waiting_list")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: caller.id,
      })
      .eq("id", waiting_list_id);

    if (updateWaitingError) {
      console.error("Error updating waiting list:", updateWaitingError);
    }

    // Send email with credentials
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      
      const loginUrl = `${req.headers.get("origin") || "https://vegtxitejztnhnsobzqi.lovable.app"}/auth?mode=login`;
      
      const { error: emailError } = await resend.emails.send({
        from: "Entrenamiento Maratón <activmente@authomata.io>",
        to: [waitingEntry.email],
        subject: "¡Tu solicitud ha sido aprobada! 🎉",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido al equipo!</h1>
              </div>
              
              <div style="padding: 40px 30px;">
                <p style="font-size: 18px; color: #333; margin-bottom: 24px;">
                  Hola <strong>${waitingEntry.first_name}</strong>,
                </p>
                
                <p style="color: #666; line-height: 1.6; margin-bottom: 24px;">
                  Tu solicitud para unirte al programa de entrenamiento ha sido aprobada. 
                  Ya puedes acceder a tu plan de ${waitingEntry.selected_distance?.toUpperCase() || "entrenamiento"}.
                </p>
                
                <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                  <h3 style="margin: 0 0 16px 0; color: #333; font-size: 16px;">Tus credenciales de acceso:</h3>
                  <p style="margin: 8px 0; color: #666;">
                    <strong>Email:</strong> ${waitingEntry.email}
                  </p>
                  <p style="margin: 8px 0; color: #666;">
                    <strong>Contraseña temporal:</strong> 
                    <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${temporaryPassword}</code>
                  </p>
                </div>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${loginUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Iniciar Sesión
                  </a>
                </div>
                
                <p style="color: #999; font-size: 14px; text-align: center; margin-top: 24px;">
                  Te recomendamos cambiar tu contraseña después del primer acceso.
                </p>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                <p style="margin: 0; color: #999; font-size: 12px;">
                  Programa de Entrenamiento Maratón Caja Los Andes
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
        // Don't throw - user was created successfully, just log the email error
      } else {
        console.log(`Email sent successfully to ${waitingEntry.email}`);
      }
    } else {
      console.warn("RESEND_API_KEY not configured - skipping email");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: newUser.user.id,
        message: "User approved and created successfully" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in approve-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
