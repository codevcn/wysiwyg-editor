export enum ETextStylingType {
  BOLD = "text-styling-bold",
  ITALIC = "text-styling-italic",
  UNDERLINE = "text-styling-underline",
  STRIKE_THROUGH = "text-styling-strike-through",
  HEADING_1 = "text-sizing-heading-1",
  HEADING_2 = "text-sizing-heading-2",
  HEADING_3 = "text-sizing-heading-3",
  PARAGRAPH = "text-sizing-paragraph",
}

export enum ETextListingType {
  NUMBERED_LIST = "text-listing-numbered-list",
  BULLET_LIST = "text-listing-bullet-list",
}

export enum ERenderingMode {
  APPEND = "rendering-mode-append",
  REPLACE = "rendering-mode-replace",
}

export enum EBlockquoteType {
  BLOCKQUOTE = "text-blocking-blockquote",
}

export enum EImageBlockingType {
  IMAGE_BLOCKING = "image-blocking",
}

export enum EToolbarAction {
  BOLD = "text-styling-bold",
  ITALIC = "text-styling-italic",
  UNDERLINE = "text-styling-underline",
  STRIKE_THROUGH = "text-styling-strike-through",
  RESIZE = "text-styling-resize",
  NUMBERED_LIST = "text-listing-numbered-list",
  BULLET_LIST = "text-listing-bullet-list",
  BLOCKQUOTE = "text-blocking-blockquote",
  IMAGE_BLOCKING = "image-blocking",
}

export enum EErrorMessage {
  QUOTE_LINE_ELEMENT_NOT_FOUND = "Quote line element not found",
  INVALID_UPLOAD_IMAGE_URL = "Invalid upload image URL",
  IMAGE_SIZE_TOO_LARGE = "Image size too large",
  INVALID_IMAGE_TYPE = "Invalid image type",
  MAX_IMAGES_COUNT_TOO_LARGE = "Max images count too large",
  FILE_IS_NOT_IMAGE = "File is not image",
  SELECTION_NOT_FOUND = "Selection not found in editor content",
}

export enum ENotifyType {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}
