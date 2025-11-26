import React from "react";
import { useAuth } from "@/context/Authcontext";
import { SocketProvider } from "@/context/SocketContext";
import AppWrapper from "@/components/AuthWrapper";
import AppNavigator from "@/navigation/AppNavigator";

export default function AppContent() {
  const { token } = useAuth(); 

  return (
    <SocketProvider token={token}> 
      <AppWrapper>
        <AppNavigator /> 
      </AppWrapper>
    </SocketProvider>
  );
}
