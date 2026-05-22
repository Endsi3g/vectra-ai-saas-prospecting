interface Window {
  electron?: {
    closeOverlay?: () => void;
    closeSpotlight?: () => void;
    notifyPdfDropped?: (paths: string[]) => void;
    [key: string]: any;
  };
}
