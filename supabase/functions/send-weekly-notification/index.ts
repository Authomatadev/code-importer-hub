import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  start_date: string | null;
  current_plan_id: string | null;
  distance: string | null;
  last_activity_at: string | null;
}

interface UserProgress {
  user_id: string;
  week_id: string;
  completed: boolean;
}

function generateEmailTemplate(
  userName: string,
  weekNumber: number,
  distance: string,
  dashboardUrl: string
): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Semana de Entrenamiento te Espera</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F0F0F; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 30px;">
              <img src="https://vegtxitejztnhnsobzqi.supabase.co/storage/v1/object/public/activity-media/logo-caja-los-andes.png" alt="Caja Los Andes" style="height: 50px; width: auto;">
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #0F0F0F 100%); border-radius: 16px; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 800; color: #FFFFFF; text-transform: uppercase; letter-spacing: 2px;">
                ¡${userName}!
              </h1>
              <p style="margin: 0 0 30px 0; font-size: 18px; color: #9ca3af; line-height: 1.6;">
                Tu semana de entrenamiento te está esperando
              </p>
              
              <!-- Week Badge -->
              <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 50px; padding: 15px 30px; margin-bottom: 30px;">
                <span style="font-size: 14px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px;">Semana</span>
                <span style="display: block; font-size: 36px; font-weight: 800; color: #FFFFFF;">${weekNumber}</span>
              </div>
              
              <p style="margin: 0 0 10px 0; font-size: 16px; color: #9ca3af;">
                Plan ${distance}
              </p>
            </td>
          </tr>

          <!-- Motivational Message -->
          <tr>
            <td style="padding: 40px 20px; text-align: center;">
              <h2 style="margin: 0 0 15px 0; font-size: 24px; font-weight: 700; color: #FFFFFF;">
                NO TE DETENGAS AHORA
              </h2>
              <p style="margin: 0 0 30px 0; font-size: 16px; color: #9ca3af; line-height: 1.8;">
                Cada paso cuenta. Cada kilómetro te acerca más a tu meta.<br>
                El Maratón de Santiago 2026 está más cerca de lo que crees.
              </p>
              
              <!-- CTA Button -->
              <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #FFFFFF; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                CONTINUAR MI ENTRENAMIENTO
              </a>
            </td>
          </tr>

          <!-- Stats Section -->
          <tr>
            <td style="padding: 20px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #1a1a1a; border-radius: 12px;">
                <tr>
                  <td style="padding: 25px; text-align: center; border-right: 1px solid #333;">
                    <span style="display: block; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Tu Meta</span>
                    <span style="display: block; font-size: 28px; font-weight: 800; color: #3b82f6; margin-top: 5px;">${distance}</span>
                  </td>
                  <td style="padding: 25px; text-align: center;">
                    <span style="display: block; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Fecha</span>
                    <span style="display: block; font-size: 28px; font-weight: 800; color: #f59e0b; margin-top: 5px;">26 ABR</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 40px 20px; text-align: center; border-top: 1px solid #333;">
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280;">
                Afiliados Caja Los Andes: Entrenamiento SIN COSTO
              </p>
              <p style="margin: 0; font-size: 12px; color: #4b5563;">
                Si no deseas recibir más correos, puedes actualizar tus preferencias en tu perfil.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function calculateCurrentWeek(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

function isInactive(lastActivityAt: string | null, daysThreshold: number = 7): boolean {
  if (!lastActivityAt) return true;
  const lastActivity = new Date(lastActivityAt);
  const now = new Date();
  const diffTime = now.getTime() - lastActivity.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= daysThreshold;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const dashboardUrl = "https://maraton-caja-los-andes.lovable.app/dashboard";

    console.log("Starting weekly notification process...");

    // Get all users with active plans
    const { data: users, error: usersError } = await supabase
      .from("user_profiles")
      .select("*")
      .not("current_plan_id", "is", null)
      .not("start_date", "is", null)
      .not("email", "is", null);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    console.log(`Found ${users?.length || 0} users with active plans`);

    const results = {
      total: users?.length || 0,
      sent: 0,
      skipped: 0,
      errors: 0,
    };

    for (const user of users || []) {
      try {
        // Check if user is inactive
        if (!isInactive(user.last_activity_at)) {
          console.log(`User ${user.email} is active, skipping`);
          results.skipped++;
          continue;
        }

        // Calculate current week
        const currentWeek = calculateCurrentWeek(user.start_date!);
        
        // Get week_id for current week
        const { data: weekData, error: weekError } = await supabase
          .from("weeks")
          .select("id")
          .eq("plan_id", user.current_plan_id)
          .eq("week_number", currentWeek)
          .single();

        if (weekError || !weekData) {
          console.log(`Week ${currentWeek} not found for user ${user.email}, plan may be completed`);
          results.skipped++;
          continue;
        }

        // Check if week is already completed
        const { data: progress, error: progressError } = await supabase
          .from("user_progress")
          .select("completed")
          .eq("user_id", user.id)
          .eq("week_id", weekData.id)
          .single();

        if (progress?.completed) {
          console.log(`User ${user.email} already completed week ${currentWeek}, skipping`);
          results.skipped++;
          continue;
        }

        // Send notification
        const userName = user.first_name || user.full_name?.split(" ")[0] || "Atleta";
        const distance = user.distance || "42K";

        const emailHtml = generateEmailTemplate(userName, currentWeek, distance, dashboardUrl);

        const { error: emailError } = await resend.emails.send({
          from: "Maratón Santiago 2026 <onboarding@resend.dev>",
          to: [user.email!],
          subject: `🏃 ${userName}, tu Semana ${currentWeek} te espera`,
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Error sending email to ${user.email}:`, emailError);
          
          // Log failed notification
          await supabase.from("notification_logs").insert({
            user_id: user.id,
            recipient_email: user.email!,
            notification_type: "weekly_reminder",
            status: "failed",
            error_message: emailError.message,
          });
          
          results.errors++;
          continue;
        }

        // Log successful notification
        await supabase.from("notification_logs").insert({
          user_id: user.id,
          recipient_email: user.email!,
          notification_type: "weekly_reminder",
          status: "sent",
        });

        console.log(`Successfully sent notification to ${user.email}`);
        results.sent++;

      } catch (userError) {
        console.error(`Error processing user ${user.email}:`, userError);
        results.errors++;
      }
    }

    console.log("Weekly notification process completed:", results);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-weekly-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
