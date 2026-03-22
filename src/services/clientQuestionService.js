import { supabase } from '../config/supabaseClient';

export const clientQuestionService = {
  /**
   * Save a client question to the database
   */
  async saveQuestion(question) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('client_questions')
        .insert([
          {
            client_id: user.id,
            question: question.question,
            question_type: question.question_type || 'general',
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error saving client question:', error);
      throw error;
    }
  },

  /**
   * Get all questions for current client
   */
  async getClientQuestions() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('client_questions')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching client questions:', error);
      throw error;
    }
  },

  /**
   * Get pending questions for RC dashboard
   */
  async getPendingQuestions() {
    try {
      const { data, error } = await supabase
        .from('client_questions')
        .select('*, clients(name, email, client_number)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching pending questions:', error);
      throw error;
    }
  },

  /**
   * Update question status (for RC dashboard)
   */
  async updateQuestionStatus(questionId, status, answer = null) {
    try {
      const update = { status };
      
      if (status === 'answered' && answer) {
        update.answer = answer;
        update.answered_at = new Date().toISOString();
      }

      if (status === 'resolved') {
        update.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('client_questions')
        .update(update)
        .eq('id', questionId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating question status:', error);
      throw error;
    }
  }
};
