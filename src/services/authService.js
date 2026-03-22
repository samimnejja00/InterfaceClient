import { getSupabaseOrThrow } from '../config/supabaseClient';

/**
 * Sign up a new client
 * @param {string} email - Client email
 * @param {string} password - Client password
 * @param {object} clientData - Additional client information
 * @returns {Promise} Result of signup
 */
export const signUp = async (email, password, clientData) => {
  try {
    const supabase = getSupabaseOrThrow();
    // Sign up with metadata so the trigger can use it
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: clientData.name || '',
        },
      },
    });

    if (error) throw error;

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update client profile with additional information
    // The trigger creates the basic profile, we update it with extra fields
    if (data.user) {
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          phone: clientData.phone || null,
          client_number: clientData.clientNumber || null,
          updated_at: new Date(),
        })
        .eq('id', data.user.id);

      if (updateError) {
        console.warn('Warning: Could not update client profile:', updateError);
        // Don't throw - the profile was created by the trigger, this is just extra data
      }
    }

    return { success: true, data };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Login client with email and password
 * @param {string} email - Client email
 * @param {string} password - Client password
 * @returns {Promise} Result of login
 */
export const login = async (email, password) => {
  try {
    const supabase = getSupabaseOrThrow();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch client profile
    if (data.user) {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (clientError && clientError.code !== 'PGRST116') {
        throw clientError;
      }

      return { success: true, data: { ...data, profile: clientData } };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Logout current client
 * @returns {Promise} Result of logout
 */
export const logout = async () => {
  try {
    const supabase = getSupabaseOrThrow();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get current authenticated user
 * @returns {Promise} Current user data
 */
export const getCurrentUser = async () => {
  try {
    const supabase = getSupabaseOrThrow();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    if (user) {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', user.id)
        .single();

      return { user, profile: clientData };
    }

    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Update client profile
 * @param {string} clientId - Client ID
 * @param {object} updates - Fields to update
 * @returns {Promise} Result of update
 */
export const updateProfile = async (clientId, updates) => {
  try {
    const supabase = getSupabaseOrThrow();
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clientId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, error: error.message };
  }
};
