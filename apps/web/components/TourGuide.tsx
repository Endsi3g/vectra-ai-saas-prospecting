'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X, ChevronRight, ChevronLeft, Sparkles, Compass } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

interface TourGuideProps {
  onClose: () => void;
}

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  position: 'right' | 'left' | 'bottom' | 'top' | 'center';
  path: string;
}

export default function TourGuide({ onClose }: TourGuideProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const steps: TourStep[] = [
    {
      targetId: 'sidebar-nav-dashboard',
      path: '/app',
      title: 'Bienvenue sur Vectra ! 👋',
      description: 'Voici votre tableau de bord. Vous pouvez y suivre vos recherches actives, la consommation de crédits et l\'activité de vos campagnes.',
      position: 'right',
    },
    {
      targetId: 'sourcing-chat-input',
      path: '/app/sourcing',
      title: '1. Recherche assistée par IA 🔍',
      description: 'Saisissez votre cible en langage naturel. L\'agent IA Hermes-Agent recherchera des profils en temps réel via ScrapeGraphAI.',
      position: 'top',
    },
    {
      targetId: 'library-database-container',
      path: '/app/library',
      title: '2. Votre Bibliothèque de Leads 📚',
      description: 'Retrouvez ici tous les prospects sauvegardés. Vous pouvez également inviter des collaborateurs et synchroniser vos réseaux partagés.',
      position: 'top',
    },
    {
      targetId: 'campaign-config',
      path: '/app/outreach',
      title: '3. Personnalisation (Outreach) 🎯',
      description: 'Définissez les paramètres de votre campagne (votre offre commerciale, votre client idéal (ICP) et l\'angle d\'approche).',
      position: 'right',
    },
    {
      targetId: 'import-leads',
      path: '/app/outreach',
      title: 'Importez vos Prospects 📥',
      description: 'Glissez-déposez un fichier CSV ou copiez-collez des contacts directement depuis LinkedIn ou Excel.',
      position: 'top',
    },
    {
      targetId: 'generate-btn',
      path: '/app/outreach',
      title: 'Générez les Messages ⚡',
      description: 'Lancez la personnalisation par l\'IA. Un e-mail et un message LinkedIn uniques seront rédigés pour chaque prospect.',
      position: 'top',
    },
    {
      targetId: 'outreach-results',
      path: '/app/outreach',
      title: 'Révisez et Exportez 🚀',
      description: 'Parcourez les messages générés, éditez-les si nécessaire et approuvez-les pour l\'export final en CSV.',
      position: 'left',
    },
  ];

  const activeStep = steps[currentStep];

  useEffect(() => {
    if (!activeStep) return;

    // Reset styles on all step highlighted elements
    steps.forEach((step) => {
      const prevEl = document.getElementById(step.targetId);
      if (prevEl) {
        prevEl.classList.remove('ring-4', 'ring-primary', 'ring-offset-4', 'z-50', 'relative');
      }
    });

    const updatePosition = () => {
      const element = document.getElementById(activeStep.targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });

        // Add highlight classes to the active element
        element.classList.add('ring-4', 'ring-primary', 'ring-offset-4', 'z-50', 'relative');
      } else {
        setCoords(null);
      }
    };

    // Delay checking multiple times to ensure DOM elements on newly navigated pages are fully rendered and sized
    updatePosition();
    const timer1 = setTimeout(updatePosition, 100);
    const timer2 = setTimeout(updatePosition, 300);
    const timer3 = setTimeout(updatePosition, 600);
    const timer4 = setTimeout(updatePosition, 1200);
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      
      // Cleanup highlights on active element
      const element = document.getElementById(activeStep.targetId);
      if (element) {
        element.classList.remove('ring-4', 'ring-primary', 'ring-offset-4', 'z-50', 'relative');
      }
    };
  }, [currentStep, activeStep, pathname]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = steps[currentStep + 1];
      if (nextStep && nextStep.path && nextStep.path !== window.location.pathname) {
        router.push(nextStep.path);
      }
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = steps[currentStep - 1];
      if (prevStep && prevStep.path && prevStep.path !== window.location.pathname) {
        router.push(prevStep.path);
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Remove highlights on all elements
    steps.forEach((step) => {
      const el = document.getElementById(step.targetId);
      if (el) {
        el.classList.remove('ring-4', 'ring-primary', 'ring-offset-4', 'z-50', 'relative');
      }
    });
    onClose();
  };

  // Determine popover position styles
  const getPopoverStyle = (): React.CSSProperties => {
    if (!activeStep || !coords || !popoverRef.current) {
      // Center of screen fallback
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
      };
    }

    const popoverRect = popoverRef.current.getBoundingClientRect();
    const gap = 16;
    let top = 0;
    let left = 0;

    switch (activeStep.position) {
      case 'right':
        top = coords.top + (coords.height / 2) - (popoverRect.height / 2);
        left = coords.left + coords.width + gap;
        break;
      case 'left':
        top = coords.top + (coords.height / 2) - (popoverRect.height / 2);
        left = coords.left - popoverRect.width - gap;
        break;
      case 'bottom':
        top = coords.top + coords.height + gap;
        left = coords.left + (coords.width / 2) - (popoverRect.width / 2);
        break;
      case 'top':
        top = coords.top - popoverRect.height - gap;
        left = coords.left + (coords.width / 2) - (popoverRect.width / 2);
        break;
      default:
        // Center
        return {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
        };
    }

    // Boundary constraints to keep popover within screen limits
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (left < gap) left = gap;
    if (left + popoverRect.width > screenWidth - gap) left = screenWidth - popoverRect.width - gap;
    if (top < gap) top = gap;
    if (top + popoverRect.height > screenHeight - gap) top = screenHeight - popoverRect.height - gap;

    return {
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 100,
    };
  };

  if (!activeStep) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-none">
      {/* Background Dim Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto"
        onClick={handleComplete}
      />

      {/* Spotlight highlight overlay cutout client coordinates */}
      {coords && (
        <div 
          className="absolute border border-primary/30 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all duration-300 pointer-events-none"
          style={{
            top: `${coords.top - 4}px`,
            left: `${coords.left - 4}px`,
            width: `${coords.width + 8}px`,
            height: `${coords.height + 8}px`,
          }}
        />
      )}

      {/* Guide Popover Dialog */}
      <div
        ref={popoverRef}
        className="w-[320px] rounded-xl border border-zinc-200 bg-white/95 p-5 shadow-2xl backdrop-blur-md transition-all duration-300 pointer-events-auto dark:border-zinc-800 dark:bg-zinc-900/95"
        style={getPopoverStyle()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Compass className="h-4 w-4 animate-spin-slow" />
            <span>Guide ({currentStep + 1} / {steps.length})</span>
          </div>
          <button 
            onClick={handleComplete} 
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="my-4">
          <h4 className="font-bold text-zinc-950 dark:text-white text-sm flex items-center gap-1.5">
            {activeStep.title}
          </h4>
          <p className="mt-2 text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
            {activeStep.description}
          </p>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <button 
            onClick={handleComplete}
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Passer
          </button>
          
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack} 
                className="h-8 px-2 text-xs"
              >
                <ChevronLeft className="h-4 w-4 mr-0.5" />
                Retour
              </Button>
            )}
            
            <Button 
              size="sm" 
              onClick={handleNext} 
              className="h-8 bg-primary hover:bg-primary/90 text-white font-semibold text-xs gap-0.5"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Terminer
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
