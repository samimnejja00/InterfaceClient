import { supabase } from '../config/supabaseClient';

/**
 * Upload document to Supabase Storage
 * @param {string} requestId - Request ID
 * @param {File} file - Document file
 * @returns {Promise} Uploaded file path
 */
export const uploadDocument = async (requestId, file) => {
  try {
    const fileName = `${requestId}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('request-documents')
      .upload(fileName, file);

    if (error) throw error;

    // Save document record in database
    const { docData, docError } = await supabase
      .from('documents')
      .insert([
        {
          request_id: requestId,
          file_name: file.name,
          file_size: file.size,
          file_path: data.path,
          content_type: file.type,
          uploaded_at: new Date(),
        },
      ])
      .select();

    if (docError) throw docError;

    return { success: true, data: docData[0] };
  } catch (error) {
    console.error('Upload document error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all documents for a request
 * @param {string} requestId - Request ID
 * @returns {Promise} Array of documents
 */
export const getRequestDocuments = async (requestId) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('request_id', requestId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get documents error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a document
 * @param {string} documentId - Document ID
 * @param {string} filePath - File path in storage
 * @returns {Promise} Result of deletion
 */
export const deleteDocument = async (documentId, filePath) => {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('request-documents')
      .remove([filePath]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (dbError) throw dbError;

    return { success: true };
  } catch (error) {
    console.error('Delete document error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get download URL for a document
 * @param {string} filePath - File path in storage
 * @returns {Promise} Download URL
 */
export const getDocumentUrl = async (filePath) => {
  try {
    const { data } = supabase.storage
      .from('request-documents')
      .getPublicUrl(filePath);

    return { success: true, url: data.publicUrl };
  } catch (error) {
    console.error('Get document URL error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get signed download URL for a document (valid for limited time)
 * @param {string} filePath - File path in storage
 * @param {number} expiresIn - Expiration time in seconds (default 3600)
 * @returns {Promise} Signed download URL
 */
export const getSignedDocumentUrl = async (filePath, expiresIn = 3600) => {
  try {
    const { data, error } = await supabase.storage
      .from('request-documents')
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;

    return { success: true, url: data.signedUrl };
  } catch (error) {
    console.error('Get signed document URL error:', error);
    return { success: false, error: error.message };
  }
};
