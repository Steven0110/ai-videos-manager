declare module 'react-image-gallery' {
  import { Component } from 'react';

  export interface ReactImageGalleryItem {
    original: string;
    thumbnail?: string;
    originalClass?: string;
    thumbnailClass?: string;
    originalAlt?: string;
    thumbnailAlt?: string;
    originalTitle?: string;
    thumbnailTitle?: string;
    thumbnailLabel?: string;
    description?: string;
    imageSet?: ImageSet[];
    srcSet?: string;
    sizes?: string;
    bulletClass?: string;
    renderItem?: (item: ReactImageGalleryItem) => React.ReactNode;
    renderThumbInner?: (item: ReactImageGalleryItem) => React.ReactNode;
  }

  export interface ImageSet {
    srcSet: string;
    media: string;
  }

  export interface ReactImageGalleryProps {
    items: ReactImageGalleryItem[];
    showNav?: boolean;
    autoPlay?: boolean;
    lazyLoad?: boolean;
    infinite?: boolean;
    showIndex?: boolean;
    showBullets?: boolean;
    showThumbnails?: boolean;
    showPlayButton?: boolean;
    showFullscreenButton?: boolean;
    disableThumbnailScroll?: boolean;
    disableKeyDown?: boolean;
    disableSwipe?: boolean;
    useBrowserFullscreen?: boolean;
    preventDefaultTouchmoveEvent?: boolean;
    onErrorImageURL?: string;
    indexSeparator?: string;
    thumbnailPosition?: 'top' | 'right' | 'bottom' | 'left';
    startIndex?: number;
    slideDuration?: number;
    slideInterval?: number;
    slideOnThumbnailOver?: boolean;
    swipeThreshold?: number;
    swipingTransitionDuration?: number;
    onSlide?: (currentIndex: number) => void;
    onBeforeSlide?: (currentIndex: number) => void;
    onScreenChange?: (fullScreenElement: Element) => void;
    onPause?: (currentIndex: number) => void;
    onPlay?: (currentIndex: number) => void;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onImageLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
    onImageError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
    onTouchMove?: (event: React.TouchEvent<HTMLDivElement>) => void;
    onTouchEnd?: (event: React.TouchEvent<HTMLDivElement>) => void;
    onTouchStart?: (event: React.TouchEvent<HTMLDivElement>) => void;
    onMouseOver?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
    additionalClass?: string;
    renderCustomControls?: () => React.ReactNode;
    renderLeftNav?: (onClick: () => void, disabled: boolean) => React.ReactNode;
    renderRightNav?: (onClick: () => void, disabled: boolean) => React.ReactNode;
    renderPlayPauseButton?: (onClick: () => void, isPlaying: boolean) => React.ReactNode;
    renderFullscreenButton?: (onClick: () => void, isFullscreen: boolean) => React.ReactNode;
    renderItem?: (item: ReactImageGalleryItem) => React.ReactNode;
    renderThumbInner?: (item: ReactImageGalleryItem) => React.ReactNode;
    stopPropagation?: boolean;
    flickThreshold?: number;
    swipingThumbnailTransitionDuration?: number;
  }

  export default class ReactImageGallery extends Component<ReactImageGalleryProps> {
    play: () => void;
    pause: () => void;
    fullScreen: () => void;
    exitFullScreen: () => void;
    slideToIndex: (index: number) => void;
    getCurrentIndex: () => number;
  }
} 