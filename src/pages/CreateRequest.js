import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConversationForm from '../components/ConversationForm';
import '../styles/CreateRequest.css';

function CreateRequest({ clientInfo }) {
  return (
    <div className="create-request-container">
      <ConversationForm clientInfo={clientInfo} />
    </div>
  );
}

export default CreateRequest;
