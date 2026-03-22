import { supabase } from '../config/supabaseClient';

/**
 * Create a new benefit request
 * @param {string} clientId - Client ID
 * @param {object} requestData - Request information
 * @returns {Promise} Created request
 */
export const createRequest = async (clientId, requestData) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .insert([
        {
          client_id: clientId,
          policy_number: requestData.policyNumber,
          tipo_prestation: requestData.tipoPrestation,
          montant: requestData.montant,
          details_demande: requestData.detailsDemande,
          status: 'En attente',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Create request error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all requests for a client
 * @param {string} clientId - Client ID
 * @returns {Promise} Array of requests
 */
export const getClientRequests = async (clientId) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get requests error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get a single request by ID
 * @param {string} requestId - Request ID
 * @returns {Promise} Request details
 */
export const getRequestDetails = async (requestId) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get request details error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update request status
 * @param {string} requestId - Request ID
 * @param {string} newStatus - New status (En attente, En cours, Validé, Rejeté)
 * @returns {Promise} Updated request
 */
export const updateRequestStatus = async (requestId, newStatus) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .update({
        status: newStatus,
        updated_at: new Date(),
      })
      .eq('id', requestId)
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Update request status error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get request statistics for a client
 * @param {string} clientId - Client ID
 * @returns {Promise} Request statistics
 */
export const getRequestStats = async (clientId) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('status')
      .eq('client_id', clientId);

    if (error) throw error;

    const stats = {
      pending: 0,
      inReview: 0,
      approved: 0,
      rejected: 0,
    };

    data.forEach((request) => {
      switch (request.status) {
        case 'Pending':
          stats.pending++;
          break;
        case 'In Review':
          stats.inReview++;
          break;
        case 'Approved':
          stats.approved++;
          break;
        case 'Rejected':
          stats.rejected++;
          break;
        default:
          break;
      }
    });

    return { success: true, data: stats };
  } catch (error) {
    console.error('Get request stats error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a request
 * @param {string} requestId - Request ID
 * @returns {Promise} Result of deletion
 */
export const deleteRequest = async (requestId) => {
  try {
    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', requestId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete request error:', error);
    return { success: false, error: error.message };
  }
};
