import * as yup from 'yup'

// Common validation schemas
export const validationSchemas = {
  // Auth validations
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must not exceed 255 characters'),

  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password must not exceed 255 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  passwordSimple: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password must not exceed 255 characters'),

  confirmPassword: (passwordField: string = 'password') =>
    yup
      .string()
      .required('Password confirmation is required')
      .oneOf([yup.ref(passwordField)], 'Passwords must match'),

  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

  // Profile validations
  phone: yup
    .string()
    .nullable()
    .matches(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
      'Invalid phone number format'
    )
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must not exceed 20 characters'),

  phoneRequired: yup
    .string()
    .required('Phone number is required')
    .matches(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
      'Invalid phone number format'
    )
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must not exceed 20 characters'),

  bio: yup
    .string()
    .nullable()
    .max(500, 'Bio must not exceed 500 characters'),

  location: yup
    .string()
    .nullable()
    .max(100, 'Location must not exceed 100 characters'),

  // Project/Task validations
  title: yup
    .string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must not exceed 255 characters'),

  description: yup
    .string()
    .nullable()
    .max(2000, 'Description must not exceed 2000 characters'),

  status: yup
    .string()
    .required('Status is required')
    .oneOf(['draft', 'active', 'on_hold', 'completed', 'archived', 'todo', 'in_progress', 'review', 'done']),

  priority: yup
    .string()
    .required('Priority is required')
    .oneOf(['low', 'medium', 'high', 'critical']),

  // Number validations
  estimatedHours: yup
    .number()
    .nullable()
    .min(0, 'Estimated hours cannot be negative')
    .max(999, 'Estimated hours cannot exceed 999'),

  actualHours: yup
    .number()
    .nullable()
    .min(0, 'Actual hours cannot be negative')
    .max(999, 'Actual hours cannot exceed 999'),

  budget: yup
    .number()
    .nullable()
    .min(0, 'Budget cannot be negative')
    .max(999999999, 'Budget is too large'),

  // Date validations
  date: yup
    .date()
    .nullable()
    .typeError('Invalid date format'),

  dateRequired: yup
    .date()
    .required('Date is required')
    .typeError('Invalid date format'),

  startDate: yup
    .date()
    .nullable()
    .typeError('Invalid date format'),

  endDate: yup
    .date()
    .nullable()
    .typeError('Invalid date format')
    .min(yup.ref('start_date'), 'End date must be after start date'),

  dueDate: yup
    .date()
    .nullable()
    .typeError('Invalid date format')
    .min(new Date(), 'Due date cannot be in the past'),

  // URL validation
  url: yup
    .string()
    .nullable()
    .url('Invalid URL format')
    .max(255, 'URL must not exceed 255 characters'),
}

// Full form schemas
export const formSchemas = {
  // Login form
  login: yup.object({
    email: validationSchemas.email,
    password: validationSchemas.passwordSimple,
  }),

  // Register form
  register: yup.object({
    name: validationSchemas.name,
    email: validationSchemas.email,
    password: validationSchemas.password,
    password_confirmation: validationSchemas.confirmPassword('password'),
  }),

  // Profile form
  profile: yup.object({
    name: validationSchemas.name,
    email: validationSchemas.email,
    phone: validationSchemas.phone,
    bio: validationSchemas.bio,
    location: validationSchemas.location,
  }),

  // Change password form
  changePassword: yup.object({
    currentPassword: validationSchemas.passwordSimple,
    newPassword: validationSchemas.password,
    confirmPassword: validationSchemas.confirmPassword('newPassword'),
  }),

  // Project form
  project: yup.object({
    name: validationSchemas.title,
    description: validationSchemas.description,
    status: validationSchemas.status,
    priority: validationSchemas.priority,
    start_date: validationSchemas.startDate,
    end_date: validationSchemas.endDate,
    budget: validationSchemas.budget,
  }),

  // Task form
  task: yup.object({
    title: validationSchemas.title,
    description: validationSchemas.description,
    status: validationSchemas.status,
    priority: validationSchemas.priority,
    estimated_hours: validationSchemas.estimatedHours,
    due_date: validationSchemas.date,
  }),

  // User form (Admin)
  user: yup.object({
    name: validationSchemas.name,
    email: validationSchemas.email,
    role: yup.string().required('Role is required').oneOf(['admin', 'manager', 'member']),
    password: yup.string().when('$isEdit', {
      is: false,
      then: (schema) => validationSchemas.password,
      otherwise: (schema) => schema.nullable(),
    }),
  }),

  // Time tracking form
  timeEntry: yup.object({
    hours: yup
      .number()
      .required('Hours is required')
      .min(0.1, 'Hours must be at least 0.1')
      .max(24, 'Hours cannot exceed 24 per entry'),
    description: yup
      .string()
      .nullable()
      .max(500, 'Description must not exceed 500 characters'),
    date: validationSchemas.dateRequired,
  }),
}

// Helper function to format validation errors
export const formatValidationErrors = (errors: any): Record<string, string> => {
  const formatted: Record<string, string> = {}
  
  if (errors.inner) {
    errors.inner.forEach((error: any) => {
      if (error.path) {
        formatted[error.path] = error.message
      }
    })
  }
  
  return formatted
}
