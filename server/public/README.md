# Image Upload Setup Instructions

## ✅ Backend is Ready!

The server is now configured for local image uploads using Multer.

## 📁 Create Upload Folder

**Manually create this folder:**
```
server/public/images/
```

Or run this command in your terminal:
```bash
cd server
mkdir public
mkdir public/images
```

## 📤 API Endpoints

### Upload Product Images (Multiple)
```http
POST /api/products/upload
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Form Data:
- images: [file1, file2, file3...] (up to 10 images)
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "url": "http://localhost:5000/public/images/images-1234567890.jpg",
      "filename": "images-1234567890.jpg",
      "size": 245678
    }
  ]
}
```

### Upload Single Image (Product or Category)
```http
POST /api/products/upload-single
POST /api/categories/upload
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Form Data:
- image: [file]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "http://localhost:5000/public/images/image-1234567890.jpg",
    "filename": "image-1234567890.jpg",
    "size": 123456
  }
}
```

## 🖼️ Image URLs in Database

When saving to database, use the `url` field from the upload response:

**Product:**
```javascript
{
  mainImage: "http://localhost:5000/public/images/image-123.jpg",
  images: [
    { url: "http://localhost:5000/public/images/image-123.jpg" },
    { url: "http://localhost:5000/public/images/image-456.jpg" }
  ]
}
```

**Category:**
```javascript
{
  image: "http://localhost:5000/public/images/category-123.jpg"
}
```

## 📝 File Restrictions

- **Allowed Types:** jpeg, jpg, png, webp, gif
- **Max File Size:** 5MB per image
- **Max Images:** 10 per upload (for multiple upload)

## 🌐 Access Images

Images are accessible at:
```
http://localhost:5000/public/images/<filename>
```

Example:
```
http://localhost:5000/public/images/images-1678901234567.jpg
```

## 🎨 Frontend Usage

In your React components, use the image URL directly:

```jsx
<img src={product.mainImage} alt={product.name} />
// or
<img src="http://localhost:5000/public/images/image-123.jpg" />
```

## 🔧 Troubleshooting

### Images not showing?
1. Check if `server/public/images` folder exists
2. Check if images were uploaded successfully
3. Check server is running on port 5000
4. Check image URLs in database are correct

### Upload failing?
1. Check file size (max 5MB)
2. Check file type (only images allowed)
3. Check admin token in Authorization header
4. Check multer middleware is configured
