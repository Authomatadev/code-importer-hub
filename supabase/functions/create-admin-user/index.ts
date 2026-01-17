import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, rut, first_name, last_name, distance, difficulty } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    console.log(`Creating admin user: ${email}`);

    // Step 1: Create user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      // If user already exists, try to get their ID and update password
      if (authError.message.includes("already been registered")) {
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === email);
        
        if (existingUser) {
          // Update password for existing user
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            { password, email_confirm: true }
          );
          
          if (updateError) {
            throw new Error(`Failed to update existing user: ${updateError.message}`);
          }
          
          console.log(`Updated existing user: ${existingUser.id}`);
          
          // Continue with existing user ID
          return await completeUserSetup(supabaseAdmin, existingUser.id, {
            email, rut, first_name, last_name, distance, difficulty
          });
        }
      }
      throw new Error(`Auth error: ${authError.message}`);
    }

    const userId = authData.user.id;
    console.log(`Created auth user: ${userId}`);

    return await completeUserSetup(supabaseAdmin, userId, {
      email, rut, first_name, last_name, distance, difficulty
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating admin user:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function completeUserSetup(
  supabaseAdmin: any,
  userId: string,
  data: { email: string; rut: string; first_name: string; last_name: string; distance: string; difficulty: number }
) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Step 2: Upsert user profile
  const { error: profileError } = await supabaseAdmin
    .from("user_profiles")
    .upsert({
      id: userId,
      email: data.email,
      rut: data.rut,
      first_name: data.first_name,
      last_name: data.last_name,
      full_name: `${data.first_name} ${data.last_name}`,
      distance: data.distance,
      difficulty: data.difficulty,
      is_first_login: false,
      start_date: new Date().toISOString().split("T")[0],
    }, { onConflict: 'id' });

  if (profileError) {
    console.error("Profile error:", profileError);
    throw new Error(`Profile error: ${profileError.message}`);
  }
  console.log("User profile created/updated");

  // Step 3: Assign admin role
  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .upsert({ 
      user_id: userId, 
      role: 'admin' 
    }, { onConflict: 'user_id,role' });

  if (roleError) {
    console.error("Role error:", roleError);
    // Try insert if upsert fails
    const { error: insertRoleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: 'admin' });
    
    if (insertRoleError && !insertRoleError.message.includes("duplicate")) {
      throw new Error(`Role error: ${insertRoleError.message}`);
    }
  }
  console.log("Admin role assigned");

  // Step 4: Update waiting_list status
  const { error: waitingError } = await supabaseAdmin
    .from("waiting_list")
    .update({ 
      status: 'approved', 
      approved_at: new Date().toISOString() 
    })
    .eq("email", data.email);

  if (waitingError) {
    console.error("Waiting list error:", waitingError);
  }
  console.log("Waiting list updated");

  return new Response(
    JSON.stringify({ 
      success: true, 
      userId,
      message: "Admin user created successfully"
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
