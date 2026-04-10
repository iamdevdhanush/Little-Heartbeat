import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => !!supabase;

export const signUp = async (email, password) => {
  if (!supabase) return { error: 'Supabase not configured' };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return { data, error };
};

export const signIn = async (email, password) => {
  if (!supabase) return { error: 'Supabase not configured' };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

export const signOut = async () => {
  if (!supabase) return { error: 'Supabase not configured' };

  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const saveUserProfile = async (userId, profile) => {
  if (!supabase) return { error: 'Supabase not configured' };

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error };
};

export const getUserProfile = async (userId) => {
  if (!supabase) return { data: null, error: 'Supabase not configured' };

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
};

export const saveHealthLog = async (userId, healthData) => {
  if (!supabase) return { error: 'Supabase not configured' };

  const { data, error } = await supabase
    .from('health_logs')
    .insert({
      user_id: userId,
      ...healthData,
    })
    .select()
    .single();

  return { data, error };
};

export const getHealthLogs = async (userId, limit = 30) => {
  if (!supabase) return { data: [], error: 'Supabase not configured' };

  const { data, error } = await supabase
    .from('health_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data: data || [], error };
};

export const saveEmergencyContact = async (userId, contact) => {
  if (!supabase) return { error: 'Supabase not configured' };

  const { data, error } = await supabase
    .from('emergency_contacts')
    .upsert({
      user_id: userId,
      ...contact,
    })
    .select()
    .single();

  return { data, error };
};

export const getEmergencyContacts = async (userId) => {
  if (!supabase) return { data: [], error: 'Supabase not configured' };

  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', userId);

  return { data: data || [], error };
};

export const shareWithPartner = async (userId, partnerEmail) => {
  if (!supabase) return { error: 'Supabase not configured' };

  const { data, error } = await supabase
    .from('share_invites')
    .insert({
      owner_id: userId,
      partner_email: partnerEmail,
      status: 'pending',
    });

  return { data, error };
};

export const acceptShareInvite = async (userId, inviteId) => {
  if (!supabase) return { error: 'Supabase not configured' };

  const { data, error } = await supabase
    .from('share_invites')
    .update({ 
      partner_id: userId,
      status: 'accepted',
    })
    .eq('id', inviteId)
    .select()
    .single();

  return { data, error };
};

export const getSharedProfiles = async (userId) => {
  if (!supabase) return { data: [], error: 'Supabase not configured' };

  const { data: invites, error } = await supabase
    .from('share_invites')
    .select('*')
    .eq('partner_id', userId)
    .eq('status', 'accepted');

  if (error || !invites) return { data: [], error };

  const ownerIds = invites.map(i => i.owner_id);
  
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .in('user_id', ownerIds);

  return { data: profiles || [], error: profileError };
};

export const uploadProfilePicture = async (userId, base64Image) => {
  if (!supabase) return { error: 'Supabase not configured' };

  const fileName = `${userId}/profile-${Date.now()}.jpg`;

  const { data, error } = await supabase.storage
    .from('profile-pictures')
    .upload(fileName, base64Image, {
      contentType: 'image/jpeg',
    });

  if (error) return { error };

  const { data: urlData } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(fileName);

  return { data: urlData.publicUrl, error: null };
};

export const subscribeToHealthUpdates = (userId, callback) => {
  if (!supabase) return null;

  const subscription = supabase
    .channel('health-updates')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'health_logs',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
};
