# MYANS Armenian Style

Build a complete, production-ready, mobile-first e-commerce website for an Armenian streetwear clothing brand called MYANS.

IMPORTANT: This is a real e-commerce application, not just a visual mockup.



1. BRAND

Brand name: MYANS

MYANS is a modern Armenian streetwear brand. The first product category is T-shirts.

The brand identity should feel:

Minimal

Premium

Modern

Confident

Independent

Young

Armenian, but not souvenir-like

Fashion-oriented

Do NOT copy any existing brand’s designs, slogans, logos, or visual identity.

The previously mentioned phrase “ԱԶԱՏ ՄԱՐԴ” was only an example of a general mood. Do NOT use it as a product name, slogan, or mandatory design.

MYANS must develop its own visual identity.



2. LANGUAGE

This is extremely important.

All customer-facing UI text must be in Armenian.

All Admin Panel UI text must also be in Armenian.

Examples:

Խանութ

Նորույթներ

Մեր մասին

Զամբյուղ

Ավելացնել զամբյուղ

Պատվիրել

Գին

Չափս

Գույն

Առկա է

Առկա չէ

Ավելացնել ապրանք

Փոփոխել

Ջնջել

Պատվերներ

Կարգավորումներ

Do NOT display English UI labels to the customer unless they are part of the MYANS brand identity.

Technical code, variable names, database fields, comments, and developer-facing elements may remain in English.



3. DESIGN SYSTEM

Use a clean, premium, minimalist fashion aesthetic.

Primary colors:

Black: #111111

White: #FFFFFF

Off-white

Light gray

Dark gray

Avoid unnecessary bright colors.

The MYANS logo should simply be:

MYANS

Black typography on a white background.

Do not add a random icon next to the logo.

Use modern sans-serif typography with strong Armenian font support.

Use generous whitespace.

Use large, high-quality product photography.

Avoid the generic look of a template or cheap online store.

The visual quality should feel closer to a modern independent fashion brand.



4. MOBILE-FIRST

Build the entire website mobile-first.

It must work perfectly on:

iPhone

Android phones

Tablets

Laptops

Desktop computers

Pay special attention to iPhone Safari.

All buttons, inputs, product cards and navigation elements must be comfortable for touch interaction.

The Admin Panel must also work properly on an iPhone.

The store owner must be able to manage the entire store from an iPhone.



5. TECHNOLOGY

Use:

React

TypeScript

Tailwind CSS

Supabase

Use Supabase for:

PostgreSQL database

Authentication

Storage

Product images

Orders

Admin access

Row Level Security

Do NOT store the real product catalog only in localStorage.

Products must be stored in the database.

Product images must be stored in Supabase Storage.

Orders must be stored in the database.



6. MAIN WEBSITE

Create these main pages:

Home

Shop

Product Details

Cart

Checkout

Order Confirmation

About

Navigation:

MYANS

Խանութ
Նորույթներ
Մեր մասին
Search
Cart

On mobile use:

MYANS
Menu
Cart

Keep the navigation extremely clean.



7. HOME PAGE

Create a premium fashion-style homepage.

Hero section:

MYANS

ARMENIAN STREETWEAR

[ Դիտել հավաքածուն ]

Keep the hero text minimal.

Use a large product/fashion image area.

The hero image must later be manageable from the Admin Panel.

Below the hero:

COLLECTION 01

Display the current products from the database.

Do not hard-code the products into the frontend.

Create a responsive product grid.



8. PRODUCT CARDS

Each product card should display:

Product image

Product name

Price

Color

Availability

Price must be displayed in Armenian Dram.

Example:

14,900 ֏

Use proper Armenian number formatting.

If a product is unavailable, clearly show:

Առկա չէ

and disable the Add to Cart button.

If available:

Ավելացնել զամբյուղ



9. PRODUCT DETAILS PAGE

Create a dedicated page for every product.

Display:

Main image

Multiple product images

Image gallery

Product name

Price

Color

Available sizes

Stock/availability

Description

Add to Cart

Sizes:

S
M
L
XL
XXL

However, sizes must be configurable per product through the Admin Panel.

If a size is unavailable, visually disable it.



10. SHOPPING CART

Create a real shopping cart.

The user must be able to:

Add products

Select size

Change quantity

Remove products

See subtotal

See total

Display prices in ֏.

The cart must work properly on mobile.

Persist the cart between page refreshes.



11. CHECKOUT

Create a simple Armenian checkout page.

Fields:

Անուն
Հեռախոսահամար
Քաղաք
Հասցե
Լրացուցիչ նշում

Display the order summary.

Display:

Ապրանքների ընդհանուր արժեքը

Առաքում

Ընդհանուր

[ Հաստատել պատվերը ]

For the first version, do NOT implement a real payment gateway.

Create the architecture so a payment provider can be added later.



12. ORDER DATABASE

Create an orders table.

Each order should store:

Order ID

Customer name

Phone

City

Address

Notes

Products

Selected sizes

Quantities

Product prices at the moment of purchase

Total

Order status

Created date

Do not rely on current product prices when displaying old orders.

The order must preserve the price that existed when the customer placed the order.



13. ADMIN PANEL

Create a secure separate Admin Panel.

Route:

/admin

Admin login must be required.

Only authorized admin users can access it.

All Admin Panel UI text must be Armenian.



14. ADMIN DASHBOARD

Create a dashboard showing:

Ապրանքների քանակը

Առկա ապրանքներ

Նոր պատվերներ

Բոլոր պատվերները

Ընդհանուր վաճառք

Use clean cards and simple statistics.



15. PRODUCT MANAGEMENT

Create an Admin → Products section.

Admin must be able to:

Add product

Fields:

Անվանում

Գին

Նկարագրություն

Գույն

Չափսեր

Կատեգորիա

Հավաքածու

Առկայություն

Նկարներ



16. PRODUCT IMAGE MANAGEMENT

This is one of the most important requirements.

The admin must be able to upload product images directly from:

iPhone Photos

Android Gallery

Computer

Do NOT require the admin to enter an image URL.

Create an Upload Image button.

Allow:

Upload main image

Upload multiple images

Replace image

Delete image

Reorder images

Select which image is the main image

Store uploaded images in Supabase Storage.

Add:

Upload progress/loading state

Error handling

Image preview

Delete confirmation

Optimize images for web performance.



17. PRODUCT EDITING

Admin must be able to edit any existing product.

Admin can change:

Product name

Price

Description

Color

Sizes

Category

Collection

Availability

Images

Changes must immediately appear on the storefront.



18. PRODUCT DELETION

Admin must be able to delete a product.

Before deletion, show an Armenian confirmation dialog:

“Վստա՞հ եք, որ ցանկանում եք ջնջել այս ապրանքը։”

If confirmed:

Delete product from database

Correctly handle its stored images

Do not leave unnecessary orphaned files



19. PRODUCT AVAILABILITY

Every product must have:

Available / Unavailable

Admin can change this with one click.

Show:

🟢 Առկա է

or

🔴 Առկա չէ

Unavailable products cannot be added to cart.



20. ORDERS ADMIN

Create Admin → Orders.

Show:

Order ID

Customer

Phone

Products

Total

Date

Status

Order statuses:

Նոր
Հաստատված
Պատրաստվում է
Առաքվում է
Ավարտված
Չեղարկված

Admin can change order status.



21. ADMIN PRODUCT SEARCH AND FILTERING

Admin should be able to search products.

Allow filtering by:

Availability

Category

Collection

Allow sorting by:

Newest

Price

Name



22. ADMIN PRODUCT DUPLICATION

Add an optional useful feature:

“Կրկնօրինակել”

This should duplicate a product so the admin can quickly create a similar T-shirt.

The duplicated product should have a new ID and should not overwrite the original.



23. ADMIN SECURITY

This is critical.

Only authenticated admin users can:

Create products

Edit products

Delete products

Upload images

Delete images

View orders

Change order status

Access dashboard

Regular visitors must never have access to admin functions.

Use Supabase Authentication.

Use Row Level Security.

Do not expose service-role keys in frontend code.

Do not store admin passwords in frontend code.



24. INITIAL DATABASE

Create a proper database schema for:

products

product_images

product_sizes

orders

order_items

admin/user roles

collections

categories

Create proper relationships and foreign keys.

Use timestamps.

Use UUIDs where appropriate.



25. INITIAL PRODUCTS

Create six placeholder products so the storefront is not empty.

Names:

MYANS 01
MYANS 02
MYANS 03
MYANS 04
MYANS 05
MYANS 06

Do NOT create fake slogans or fake designs.

Use clean neutral placeholder images until real MYANS product photos are uploaded through Admin.

Prices must be editable.



26. ABOUT PAGE

Create a minimal Armenian About page.

Concept:

MYANS-ը հայկական ժամանակակից streetwear բրենդ է՝ կառուցված ինքնության, պարզության և ժամանակակից դիզայնի շուրջ։

Keep the text short.

Do not over-explain the brand.



27. SEARCH

Add a simple product search.

Search by product name.

Make it mobile-friendly.



28. EMPTY STATES

Create Armenian empty states.

Examples:

Եթե զամբյուղը դատարկ է:

“Ձեր զամբյուղը դեռ դատարկ է։”

If there are no products:

“Այս պահին ապրանքներ չկան։”



29. ERROR STATES

All customer-facing error messages must be Armenian.

Do not show technical database errors to customers.

Create friendly error messages.



30. LOADING STATES

Add loading indicators for:

Products

Images

Cart

Checkout

Admin dashboard

Product creation

Product editing

Image uploads

Order creation



31. SEO

Add basic SEO.

Page title:

MYANS — Armenian Streetwear

Meta description:

MYANS — հայկական ժամանակակից streetwear բրենդ։

Add:

favicon

Open Graph metadata

proper page titles

semantic HTML



32. PERFORMANCE

Optimize for mobile.

Use:

responsive images

lazy loading where appropriate

optimized image sizes

minimal unnecessary JavaScript

clean component architecture

The site should feel fast on a normal mobile internet connection.



33. CODE STRUCTURE

Keep the code modular.

Separate:

pages

reusable components

hooks

services

Supabase logic

database types

authentication logic

product logic

cart logic

order logic

Use TypeScript properly.

Avoid putting the whole application inside one huge component.



34. IMPORTANT PRODUCT PHOTOGRAPHY DESIGN

The product photography should feel like a premium fashion brand.

Product cards should use large images with clean backgrounds.

Avoid excessive shadows, gradients, rounded cards, or colorful UI.

Use subtle borders and whitespace.

The product itself should remain the visual focus.



35. RESPONSIVE ADMIN PANEL

The Admin Panel must be completely usable from an iPhone.

I should be able to do all of these from my phone:

Open Admin
→ Login
→ Add product
→ Select photos from Photos
→ Enter price
→ Select sizes
→ Set availability
→ Save

And:

Open product
→ Change image
→ Change price
→ Change description
→ Change availability
→ Delete product

No desktop computer should be required for normal store management.



36. DO NOT IMPLEMENT YET

Do NOT implement:

Real payment gateway

Complex customer accounts

Loyalty program

Reviews

Advanced analytics

Multi-language system

Keep the architecture extensible so these can be added later.



37. FINAL GOAL

The final result should be a real working MVP of MYANS.

It should not look like an AI-generated generic shop.

It should look like a real independent Armenian streetwear fashion brand.

The customer experience should be:

Home
→ Collection
→ Product
→ Select size
→ Add to cart
→ Checkout
→ Order confirmation

The owner experience should be:

Admin login
→ Dashboard
→ Products
→ Upload/edit/delete product
→ Upload/change/delete photos
→ Change price
→ Change sizes
→ Set availability
→ Orders
→ Change order status

Before finishing, test the entire flow on mobile and desktop.

Make sure there are no broken routes, console errors, missing states, or inaccessible admin pages.

Start by creating the project architecture, database schema, Supabase integration, authentication, security policies, and then build the storefront and admin panel.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://myans-storefront-forge.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9e0f9e68-7886-476d-b87f-57a8dc3fab83).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
