import { supabase } from '../config/supabaseClient';

/**
 * Add an event to request timeline
 * @param {string} requestId - Request ID
 * @param {object} eventData - Event information
 * @returns {Promise} Created timeline event
 */
export const addTimelineEvent = async (requestId, eventData) => {
  try {
    const { data, error } = await supabase
      .from('request_timeline')
      .insert([
        {
          request_id: requestId,
          title: eventData.title,
          description: eventData.description,
          event_date: eventData.eventDate || new Date(),
          status: eventData.status || 'pending',
          created_at: new Date(),
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Add timeline event error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get timeline for a request
 * @param {string} requestId - Request ID
 * @returns {Promise} Array of timeline events
 */
export const getRequestTimeline = async (requestId) => {
  try {
    const { data, error } = await supabase
      .from('request_timeline')
      .select('*')
      .eq('request_id', requestId)
      .order('event_date', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get timeline error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update timeline event status
 * @param {string} timelineId - Timeline event ID
 * @param {string} newStatus - New status (completed, in-progress, pending)
 * @returns {Promise} Updated timeline event
 */
export const updateTimelineStatus = async (timelineId, newStatus) => {
  try {
    const { data, error } = await supabase
      .from('request_timeline')
      .update({ status: newStatus })
      .eq('id', timelineId)
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Update timeline status error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a timeline event
 * @param {string} timelineId - Timeline event ID
 * @returns {Promise} Result of deletion
 */
export const deleteTimelineEvent = async (timelineId) => {
  try {
    const { error } = await supabase
      .from('request_timeline')
      .delete()
      .eq('id', timelineId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete timeline event error:', error);
    return { success: false, error: error.message };
  }
};
