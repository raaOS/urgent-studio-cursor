
'use client';

import React from 'react';
import RealTimeOrderTracking from '@/components/RealTimeOrderTracking';
import { Container, Typography } from '@/components/ui/visual-consistency';
import { StaggerContainer } from '@/components/ui/micro-interactions';

export default function TrackOrderPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <Container className="py-6 sm:py-8 px-4 sm:px-6">
        <StaggerContainer>
          <div className="mb-6 sm:mb-8 text-center">
            <Typography 
              variant="h1" 
              className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4"
            >
              🔍 Lacak Pesanan
            </Typography>
            <Typography 
              variant="body" 
              className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4"
            >
              Pantau status pesanan Anda secara real-time dengan sistem tracking terdepan
            </Typography>
          </div>
          
          <RealTimeOrderTracking />
        </StaggerContainer>
      </Container>
    </div>
  );
}
