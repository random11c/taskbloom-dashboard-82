import { supabase } from "@/integrations/supabase/client";

export const createProject = async (name: string, description: string | null) => {
  console.log('Creating new project:', { name, description });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('User not authenticated');
    throw new Error('Not authenticated');
  }

  console.log('Current user:', user);

  // First, ensure the user profile exists
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    throw new Error('Please complete your profile setup first');
  }

  // Start transaction by creating the project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert([
      {
        name,
        description,
        owner_id: user.id,
      },
    ])
    .select()
    .single();

  if (projectError) {
    console.error('Project creation error:', projectError);
    throw projectError;
  }

  // Add the creator as an admin in project_members
  const { error: memberError } = await supabase
    .from('project_members')
    .insert([
      {
        project_id: project.id,
        user_id: user.id,
        role: 'admin'  // Set the creator as admin
      }
    ]);

  if (memberError) {
    console.error('Error adding project member:', memberError);
    throw memberError;
  }

  console.log('Project created successfully:', project);
  return project;
};