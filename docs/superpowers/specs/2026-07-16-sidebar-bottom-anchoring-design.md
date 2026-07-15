# Sidebar Bottom Anchoring Design

## Goal

Keep the desktop sidebar visible and continuously colored for the entire page, while anchoring the product-use guidance and workspace profile/settings controls to the viewport bottom.

## Layout

The application shell will use a fixed, viewport-height desktop sidebar. The sidebar will own its vertical scrolling rather than extending with page content. Within the sidebar, the primary navigation remains the only flexible, scrollable region; the product-use card stack and workspace profile are non-shrinking bottom regions.

On small screens, the existing overlay behavior remains unchanged.

## Verification

Tests will assert the desktop sidebar uses a fixed full-height container and that the navigation is the scrollable section. A production build will confirm the static bundle is generated successfully.
