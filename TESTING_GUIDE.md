# Testing Guide: SRS Requirements

## Test Scenario 1: User Registration & Login (RS1)
### Step 1: Register New User
- [ ] Navigate to `/register`
- [ ] Enter Full Name: "John Doe"
- [ ] Enter Email: "john@example.com"
- [ ] Enter Password: "password123"
- [ ] Confirm Password: "password123"
- [ ] Click "Register"
- **Expected:** Success message, redirect to login page

### Step 2: Email Validation
- [ ] Try registering with invalid email: "invalidemail"
- **Expected:** Error message "Please enter a valid email address"

### Step 3: Duplicate Email Prevention
- [ ] Try registering with same email again: "john@example.com"
- **Expected:** Error message "Email already registered. Please login instead."

### Step 4: Password Requirements
- [ ] Try password with less than 6 characters: "pass"
- **Expected:** Error message "Password must be at least 6 characters long"

---

## Test Scenario 2: Product Browsing & Filtering (RS2, RS3)
### Step 1: Browse Products
- [ ] Navigate to `/products`
- [ ] Verify all products display with images, names, prices, categories

### Step 2: Category Filter
- [ ] Click "Men" category
- **Expected:** Only Men's products show
- [ ] Click "Women" category
- **Expected:** Only Women's products show
- [ ] Click "All"
- **Expected:** All products show

### Step 3: Search Filter
- [ ] Type "Wool" in search box
- **Expected:** Only products containing "Wool" appear

### Step 4: Price Range Filter (NEW)
- [ ] Adjust price slider to ₹5000
- **Expected:** Only products ≤ ₹5000 show
- [ ] Adjust to maximum
- **Expected:** All products show
- [ ] Check that range display updates

### Step 5: Stock Status Display (NEW)
- [ ] Verify stock badge shows on each product card
- [ ] Example: "12 in stock" or "Out of Stock"

---

## Test Scenario 3: Product Details Page (RS4)
### Step 1: View Product Details
- [ ] Click any product card
- **Expected:** Navigated to `/product/[id]`

### Step 2: View Product Information
- [ ] Verify product name, price, image, description display
- [ ] Verify stock status shows (e.g., "✓ 12 in stock")
- [ ] Verify average rating displays (or "No ⭐" if no reviews)

### Step 3: Add to Cart from Details
- [ ] Click "ADD TO CART" button
- **Expected:** Success message, button still available
- [ ] Navigate to cart, verify item is there

### Step 4: Test Out of Stock
- [ ] Find a product with stock = 0
- **Expected:** "OUT OF STOCK" button appears, disabled

### Step 5: Review System (NEW)
- [ ] Enter your name: "Jane Smith"
- [ ] Select rating: "5 Stars"
- [ ] Enter comment: "Amazing quality!"
- [ ] Click "Submit Review"
- **Expected:** Success message, review appears in list

### Step 6: View Reviews
- [ ] Verify review displays with name, stars, comment, date
- [ ] Verify average rating updates

---

## Test Scenario 4: Shopping Cart (RS5)
### Step 1: Add Multiple Items
- [ ] Add 3 different products to cart
- [ ] Navigate to `/cart`
- **Expected:** All 3 items appear

### Step 2: Update Quantity
- [ ] Click "+" button to increase quantity
- **Expected:** Quantity increases, total updates
- [ ] Click "-" button to decrease
- **Expected:** Quantity decreases

### Step 3: Remove Item
- [ ] Click "Remove" on any item
- **Expected:** Item disappears, total updates

### Step 4: Empty Cart
- [ ] Remove all items
- **Expected:** "Your shopping bag is empty" message with "Continue Shopping" button

---

## Test Scenario 5: Checkout & Order Placement (RS6, RS7, RS11)
### Step 1: Proceed to Checkout
- [ ] Add items to cart
- [ ] Click "GO TO CHECKOUT"
- **Expected:** Navigated to `/checkout` with cart summary

### Step 2: Validate Shipping Information
- [ ] Click "PURCHASE NOW" without filling details
- **Expected:** Error message about missing fields

### Step 3: Complete Checkout
- [ ] Fill shipping form:
  - Recipient Name: "John Doe"
  - Street: "123 Main St"
  - City: "New York"
  - State: "NY"
  - ZIP: "10001"
- [ ] Click "PURCHASE NOW"
- **Expected:** Success message with Order ID, cart cleared, navigate to `/orders`

### Step 4: Stock Reduction (RS11)
- [ ] Before order: Note a product's stock (e.g., "15 in stock")
- [ ] Order that product
- [ ] Navigate to `/products`
- **Expected:** Product stock decreased (e.g., "14 in stock")

---

## Test Scenario 6: Order History (RS8)
### Step 1: View Orders
- [ ] Navigate to `/orders`
- [ ] Verify all placed orders display

### Step 2: Verify Order Details
- [ ] Check Order ID matches placed order
- [ ] Verify shipping address shows correctly
- [ ] Verify order total correct
- [ ] Verify order status shows (e.g., "PENDING")

### Step 3: Multiple Orders
- [ ] Place 2-3 more orders
- [ ] Navigate to `/orders`
- **Expected:** All orders display in list

---

## Test Scenario 7: User Profile Management (RS9)
### Step 1: Access Profile
- [ ] Navigate to `/profile`
- **Expected:** Profile page displays

### Step 2: Edit Profile Information
- [ ] Click "Edit Profile"
- [ ] Change name to "Jane Doe"
- [ ] Change email to "jane@example.com"
- [ ] Enter phone: "555-1234"
- [ ] Click "Save"
- **Expected:** Information updates

### Step 3: Add Saved Address
- [ ] In "Add New Address" section, fill:
  - Address Name: "Home"
  - Street: "456 Elm St"
  - City: "Boston"
  - State: "MA"
  - ZIP: "02101"
- [ ] Click "+ Add Address"
- **Expected:** Address appears in saved addresses list

### Step 4: Add Multiple Addresses
- [ ] Add another address with name "Office"
- [ ] Add third address with name "Vacation Home"
- **Expected:** All 3 addresses display

### Step 5: Delete Address
- [ ] Click "Delete" on one address
- **Expected:** Address removed from list

---

## Test Scenario 8: Admin Features (RS10, RS11, RS12, RS15)
### Step 1: Admin Login
- [ ] Navigate to `/admin/login` (or click admin link)
- [ ] Email: `admin@gmail.com`
- [ ] Password: `admin123`
- [ ] Click "Login"
- **Expected:** Redirect to `/admin/dashboard`

### Step 2: View Analytics (RS15)
- [ ] Check dashboard cards:
  - [ ] Total Orders: Shows number
  - [ ] Total Revenue: Shows ₹ amount
  - [ ] Products: Shows count and stock status
  - [ ] Low Stock Alert: Shows count
- **Expected:** All metrics display correctly

### Step 3: Add New Product (RS10)
- [ ] Click "+ Add Product" button
- [ ] Fill form:
  - Name: "Premium Cotton T-Shirt"
  - Price: "1500"
  - Stock: "50"
  - Category: "Men"
  - Image: "https://images.pexels.com/photos/3621881/pexels-photo-3621881.jpeg"
  - Description: "High quality cotton t-shirt"
- [ ] Click "Add Product"
- **Expected:** Product appears in table, success message

### Step 4: Edit Product (RS10)
- [ ] Click "Edit" on a product
- [ ] Change price to "1200"
- [ ] Change stock to "40"
- [ ] Click "Update Product"
- **Expected:** Product updates in table

### Step 5: Delete Product (RS10)
- [ ] Click "Delete" on a product
- [ ] Confirm deletion
- **Expected:** Product removed from table

### Step 6: Manage Orders (RS12)
- [ ] Place a customer order from user account
- [ ] Navigate to admin dashboard
- [ ] Find the order in "Order Management" table
- [ ] Change status from "Pending" to "Packed"
- **Expected:** Status updates in real-time
- [ ] Change to "Shipped"
- [ ] Change to "Delivered"
- **Expected:** Each change reflects in table

### Step 7: Verify Stock Updates in Admin (RS11)
- [ ] Check product stock before customer order
- [ ] Have customer place order
- [ ] Return to admin dashboard
- [ ] Verify product stock decreased

---

## Test Scenario 9: Wishlist (RS13)
### Step 1: Add to Wishlist
- [ ] Navigate to `/products`
- [ ] Click heart icon ❤️ on product card
- **Expected:** Heart changes to red ❤️

### Step 2: View Wishlist
- [ ] Navigate to `/wishlist`
- **Expected:** Product appears in wishlist

### Step 3: Remove from Wishlist
- [ ] Click heart icon again on product card
- **Expected:** Heart becomes white 🤍
- [ ] Navigate to wishlist
- **Expected:** Product removed

### Step 4: Add Multiple to Wishlist
- [ ] Add 5 products to wishlist
- [ ] Navigate to `/wishlist`
- **Expected:** All 5 products display

---

## Test Scenario 10: Review System (RS13)
### Step 1: Add Review
- [ ] Navigate to product details `/product/1`
- [ ] Scroll to "Customer Reviews"
- [ ] Enter Name: "Sarah Johnson"
- [ ] Select Rating: "4 Stars"
- [ ] Comment: "Great quality, arrived on time"
- [ ] Click "Submit Review"
- **Expected:** Success message, review appears

### Step 2: Multiple Reviews
- [ ] Add 3-4 reviews to same product
- [ ] Verify average rating calculates correctly
  - If reviews are 5, 4, 5, 3 stars → Average = 4.25 ⭐

### Step 3: Review Display
- [ ] Verify all reviews show with:
  - [ ] User name
  - [ ] Star rating
  - [ ] Comment text
  - [ ] Date created

---

## 🏆 Success Criteria

All tests should pass with:
- ✅ No JavaScript errors in console
- ✅ All data persists appropriately
- ✅ UI updates in real-time
- ✅ No broken links or navigation issues
- ✅ All buttons and forms functional
- ✅ Responsive design on mobile/tablet/desktop

---

## 📋 Known Limitations

These features require backend integration:
- ❌ Email notifications (RS14) - needs backend email service
- ⚠️ Data persistence across page refresh - localStorage only for users
- ⚠️ Real database - currently using React Context state

---

## 🐛 Troubleshooting

**Issue:** Stock not updating after order
- **Solution:** Verify browser console has no errors, refresh page

**Issue:** Review not appearing
- **Solution:** Ensure all fields are filled, check browser console

**Issue:** Admin changes not reflecting
- **Solution:** Return to admin dashboard page to refresh

**Issue:** Wishlist disappears on page refresh
- **Solution:** This is expected (in-memory state). For persistence, add localStorage

---

## ✨ Test Completion

Once all scenarios pass, your application is **production-ready** for the features implemented!

**Total Test Cases: 50+**
**Estimated Testing Time: 30-45 minutes**

---

Good luck with your testing! 🎉
