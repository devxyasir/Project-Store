import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormHelperText,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
} from '@mui/material';
import {
  AddPhotoAlternate,
  CloudUpload,
  Delete,
} from '@mui/icons-material';
import axios from 'axios';

const AdminAddProductPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewImages, setPreviewImages] = useState([]);
  const [technologiesInput, setTechnologiesInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    shortDescription: '',
    description: '',
    price: '',
    technologies: [],
    images: [],
    downloadLink: '',
    featured: false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/categories');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
    if (formData.shortDescription.length > 200) newErrors.shortDescription = 'Short description cannot exceed 200 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (isNaN(formData.price) || parseFloat(formData.price) < 0) newErrors.price = 'Price must be a positive number';
    if (formData.technologies.length === 0) newErrors.technologies = 'At least one technology is required';
    if (formData.images.length === 0) newErrors.images = 'At least one image is required';
    if (!formData.downloadLink) newErrors.downloadLink = 'Download link is required';
    if (formData.downloadLink && !formData.downloadLink.startsWith('http')) newErrors.downloadLink = 'Please enter a valid URL starting with http:// or https://';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleTechnologiesInputChange = (e) => {
    setTechnologiesInput(e.target.value);
  };

  const handleAddTechnology = () => {
    if (technologiesInput.trim() && !formData.technologies.includes(technologiesInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, technologiesInput.trim()]
      });
      setTechnologiesInput('');
    }
  };

  const handleRemoveTechnology = (tech) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter(t => t !== tech)
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      // Preview images
      const newPreviewImages = [...previewImages];
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviewImages.push({
            file,
            preview: e.target.result
          });
          setPreviewImages([...newPreviewImages]);
        };
        reader.readAsDataURL(file);
      });
      
      // Add to form data
      setFormData({
        ...formData,
        images: [...formData.images, ...files]
      });
    }
  };

  const handleRemoveImage = (index) => {
    const newPreviewImages = [...previewImages];
    newPreviewImages.splice(index, 1);
    setPreviewImages(newPreviewImages);
    
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const handleDownloadLinkChange = (e) => {
    setFormData({
      ...formData,
      downloadLink: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setSubmitLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // First upload images to get Cloudinary URLs
      let imageUrls = [];
      
      if (formData.images.length > 0) {
        const imageUploadPromises = formData.images.map(async (image) => {
          const imageFormData = new FormData();
          imageFormData.append('images', image);
          
          const uploadResponse = await axios.post('/api/uploads/images', imageFormData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          return uploadResponse.data.urls[0];
        });
        
        imageUrls = await Promise.all(imageUploadPromises);
      }
      
      // Now create the product with the image URLs
      const productData = {
        title: formData.title.trim(),
        categoryId: formData.categoryId,
        shortDescription: formData.shortDescription.trim(),
        description: formData.description.trim(),
        price: formData.price,
        technologies: formData.technologies,
        downloadLink: formData.downloadLink.trim(),
        featured: formData.featured,
        imagePaths: imageUrls
      };
      
      console.log('Submitting product with:', productData);
      
      const response = await axios.post('/api/products', productData);
      
      if (response.data.success) {
        setSuccess('Product added successfully!');
        setTimeout(() => {
          navigate('/admin/products');
        }, 2000);
      }
    } catch (err) {
      console.error('Error adding product:', err);
      if (err.response?.data?.errors) {
        // Display validation errors in a more readable format
        const validationErrors = err.response.data.errors;
        const errorMessages = validationErrors.map(e => `${e.msg} (${e.path})`).join('\n');
        setError(`Validation errors: \n${errorMessages}`);
      } else {
        setError(err.response?.data?.message || 'Failed to add product. Please try again later.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Add New Product
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/admin/products')}
        >
          Back to Products
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.categoryId}>
                <InputLabel>Category</InputLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  label="Category"
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoryId && <FormHelperText>{errors.categoryId}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price ($)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.01 }}
                error={!!errors.price}
                helperText={errors.price}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Featured Product</InputLabel>
                <Select
                  name="featured"
                  value={formData.featured}
                  onChange={(e) => handleCheckboxChange({
                    target: { name: 'featured', checked: e.target.value === 'true' }
                  })}
                  label="Featured Product"
                >
                  <MenuItem value="false">No</MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Short Description (max 200 chars)"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                multiline
                rows={2}
                error={!!errors.shortDescription}
                helperText={errors.shortDescription}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={6}
                error={!!errors.description}
                helperText={errors.description}
                required
              />
            </Grid>

            {/* Technologies */}
            <Grid item xs={12}>
              <Typography variant="h6" component="h2" sx={{ my: 2 }}>
                Technologies Used
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Technology"
                  value={technologiesInput}
                  onChange={handleTechnologiesInputChange}
                  error={!!errors.technologies}
                />
                <Button
                  variant="contained"
                  onClick={handleAddTechnology}
                  sx={{ ml: 2 }}
                >
                  Add
                </Button>
              </Box>
              {errors.technologies && (
                <FormHelperText error>{errors.technologies}</FormHelperText>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {formData.technologies.map((tech, index) => (
                  <Chip
                    key={index}
                    label={tech}
                    onDelete={() => handleRemoveTechnology(tech)}
                    color="primary"
                  />
                ))}
              </Box>
            </Grid>

            {/* Images */}
            <Grid item xs={12}>
              <Typography variant="h6" component="h2" sx={{ my: 2 }}>
                Product Images
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AddPhotoAlternate />}
                sx={{ mb: 2 }}
              >
                Upload Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleImageUpload}
                />
              </Button>
              {errors.images && (
                <FormHelperText error sx={{ mt: 1 }}>{errors.images}</FormHelperText>
              )}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {previewImages.map((image, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={image.preview}
                        alt={`Preview ${index}`}
                        style={{
                          width: '100%',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 5,
                          right: 5,
                          backgroundColor: 'rgba(255, 255, 255, 0.7)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          }
                        }}
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Delete color="error" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Downloadable Content */}
            <Grid item xs={12}>
              <Typography variant="h6" component="h2" sx={{ my: 2 }}>
                Downloadable Content
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Download Link"
                name="downloadLink"
                value={formData.downloadLink}
                onChange={handleDownloadLinkChange}
                placeholder="https://example.com/your-project-file.zip"
                error={!!errors.downloadLink}
                helperText={errors.downloadLink || 'Enter the URL where the project file is hosted (Google Drive, Dropbox, etc.)'}
                required
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Provide a link to the downloadable project file that customers will access after purchase.
                Make sure the link is accessible and does not expire. You can use Google Drive, Dropbox, or any other file hosting service.
              </Typography>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={submitLoading}
                sx={{ px: 4, py: 1 }}
              >
                {submitLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Add Product'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AdminAddProductPage;
