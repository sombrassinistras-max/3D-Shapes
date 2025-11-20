import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ImageGenerator } from './components/ImageGenerator';
import { ChatAssistant } from './components/ChatAssistant';
import { ImageTo3D } from './components/ImageTo3D';
import { Box, Image, MessageSquare } from 'lucide-react';

export enum View {
  IMAGE_TO_3D = 'IMAGE_TO_3D',
  IMAGE_GEN = 'IMAGE_GEN',
  CHAT = 'CHAT',
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.IMAGE_TO_3D);

  const renderView = () => {
    switch (currentView) {
      case View.IMAGE_TO_3D:
        return <ImageTo3D />;
      case View.IMAGE_GEN:
        return <ImageGenerator />;
      case View.CHAT:
        return <ChatAssistant />;
      default:
        return <ImageTo3D />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={setCurrentView}
    >
      {renderView()}
    </Layout>
  );
};

export default App;