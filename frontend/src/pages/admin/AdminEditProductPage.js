import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Save,
} from '@mui/icons-material';
import axios from 'axios';

const AdminEditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewImages, setPreviewImages] = useState([]);
  const [technologiesInput, setTechnologiesInput] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  
  // Form state
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
  
  // Form validation
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again later.');
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      // Using the new endpoint that gets products by ID
      const response = await axios.get(`/api/products/id/${id}`);
      
      if (response.data.success) {
        const product = response.data.product;
        console.log('Fetched product data:', product); // Add logging to debug
        setFormData({
          title: product.title,
          categoryId: product.category._id,
          shortDescription: product.shortDescription,
          description: product.description,
          price: product.price,
          technologies: product.technologies,
          featured: product.featured,
          downloadLink: product.downloadLink || '', // Add downloadLink
          images: []
        });

        setExistingImages(product.images.map(image => ({
          path: image,
          isExisting: true
        })));
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product. Please try again later.');
      setTimeout(() => {
        navigate('/admin/products');
      }, 2000);
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
    
    // Check if at least one image exists (either existing or new)
    if (existingImages.length === 0 && formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }
    
    // Validate download link
    if (!formData.downloadLink || formData.downloadLink.trim() === '') {
      newErrors.downloadLink = 'Download link is required';
    } else if (!formData.downloadLink.startsWith('http')) {
      newErrors.downloadLink = 'Please enter a valid URL starting with http:// or https://';
    }
    
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

  const handleRemoveExistingImage = (index) => {
    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    setExistingImages(newExistingImages);
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
      // Create FormData object for file uploads
      const productData = new FormData();
      productData.append('title', formData.title);
      productData.append('categoryId', formData.categoryId);
      productData.append('shortDescription', formData.shortDescription);
      productData.append('description', formData.description);
      productData.append('price', formData.price);
      
      formData.technologies.forEach(tech => {
        productData.append('technologies', tech);
      });
      
      // Add new images
      formData.images.forEach(image => {
        productData.append('images', image);
      });
      
      // Add existing images
      existingImages.forEach(image => {
        productData.append('existingImages', image.path);
      });
      
      // Add download link
      productData.append('downloadLink', formData.downloadLink);
      
      productData.append('featured', formData.featured);
      
      const response = await axios.put(`/api/products/${id}`, productData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setSuccess('Product updated successfully!');
        setTimeout(() => {
          navigate('/admin/products');
        }, 2000);
      }
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || 'Failed to update product. Please try again later.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Edit Product
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
                Upload New Images
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
              
              {/* Display existing images */}
              {existingImages.length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
                    Current Images
                  </Typography>
                  <Grid container spacing={2}>
                    {existingImages.map((image, index) => (
                      <Grid item xs={6} sm={4} md={3} key={`existing-${index}`}>
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={image.path.startsWith('http') ? image.path : `${process.env.REACT_APP_API_URL || ''}${image.path}`}
                            alt={`Product ${index}`}
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
                            onClick={() => handleRemoveExistingImage(index)}
                          >
                            <Delete color="error" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
              
              {/* Display new images previews */}
              {previewImages.length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
                    New Images
                  </Typography>
                  <Grid container spacing={2}>
                    {previewImages.map((image, index) => (
                      <Grid item xs={6} sm={4} md={3} key={`new-${index}`}>
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
                </>
              )}
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
                startIcon={<Save />}
                sx={{ px: 4, py: 1 }}
              >
                {submitLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Save Changes'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AdminEditProductPage;
