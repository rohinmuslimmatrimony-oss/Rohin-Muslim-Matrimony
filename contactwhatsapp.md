# WhatsApp Lead Generation & Profile Security Plan

## Part 1: WhatsApp Lead Generation Flow for Free Users

### Overview
This document outlines the planned feature to convert free users into leads when they show interest in a profile. Instead of showing a hard paywall that blocks them, we will present a WhatsApp contact option to connect them directly with the admin/support team.

### User Flow
1. **Action:** A free user navigates to a profile and clicks the **"Express Interest"** (Heart icon) or **"Contact"** button.
2. **Interception:** Instead of showing the default "Please upgrade to premium" message, the system intercepts the click.
3. **Modal Display:** A beautiful popup modal is shown with the following context:
   > *"Masha Allah! You have expressed interest in this profile. To take this forward, please contact our support team directly via WhatsApp."*
4. **Call to Action (CTA):** A prominent green button labeled **"Chat on WhatsApp"** is displayed.
5. **Redirection:** When the user clicks the CTA, it opens their WhatsApp app (or WhatsApp Web) using a `wa.me` API link.
6. **Pre-filled Message:** The WhatsApp chat will open with a dynamically generated, pre-filled message. For example:
   > *"Hello Admin, I am interested in the profile with ID: RMM12345. Could you please provide more details or help me connect with them?"*

### Implementation Details
- Identify the UI component for the "Express Interest" button.
- Add a conditional check for the user's subscription tier.
- Create a Modal component for the WhatsApp prompt.
- Define the `ADMIN_WHATSAPP_NUMBER` in the environment variables.
- Use `https://wa.me/{ADMIN_NUMBER}?text={ENCODED_MESSAGE}` for the redirection link.

---

## Part 2: Image Watermarking (Profile Security)

### Overview
To prevent unauthorized users from grabbing or stealing profile pictures from the platform, we will implement an automated backend watermarking system. Whenever a user uploads an image, the system will permanently stamp the `image stamp.png` onto the photo before saving it.

### Why Backend Watermarking?
Unlike CSS or frontend overlays (which can be easily bypassed by inspecting the browser), backend watermarking modifies the actual image file. If anyone downloads or takes a screenshot of the image, the stamp will always be visible, ensuring 100% security.

### Implementation Details
1. **Dependency:** Install the `sharp` image processing library in the Node.js backend.
   - Command: `npm install sharp` (in the `server` directory)
2. **Watermark Asset:** Move `image stamp.png` from the frontend assets to the backend server (e.g., `server/assets/image-stamp.png`).
3. **Upload Middleware Modification:**
   - Intercept the image upload in the `multer` middleware.
   - Before saving the file to the final `uploads` directory, pass it through `sharp`.
   - Use `sharp(imageBuffer).composite([{ input: 'path/to/stamp.png', gravity: 'southeast' }])` to merge the stamp with the original image.
4. **Result:** The saved file on the server is permanently watermarked. When the frontend requests the image, it automatically receives the stamped version.

*(Note: No code changes have been made yet. This document serves as the implementation plan to be executed later.)*
