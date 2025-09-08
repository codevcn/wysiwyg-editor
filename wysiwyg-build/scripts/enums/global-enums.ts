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

export enum ETextLinkingType {
  TEXT_LINKING = "text-linking",
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
  TEXT_LINKING = "text-linking",
}

export enum EErrorMessage {
  ANCHOR_NODE_NOT_FOUND = "Anchor node was not found",
  QUOTE_LINE_ELEMENT_NOT_FOUND = "Quote line element not found",
  INVALID_UPLOAD_IMAGE_URL = "Invalid upload image URL",
  IMAGE_SIZE_TOO_LARGE = "Image size too large",
  INVALID_IMAGE_TYPE = "Invalid image type",
  MAX_IMAGES_COUNT_TOO_LARGE = "Max images count too large",
  SELECTION_NOT_FOUND = "Selection not found in editor content",
  ONLY_SUPPORT_IMAGE_FILE = "Only support image file",
  TOP_BLOCK_NOT_FOUND = "Top block element not found",
  TEXT_LINK_FORM_NOT_FOUND = "Text link form not found",
}

export enum ENotifyType {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}
