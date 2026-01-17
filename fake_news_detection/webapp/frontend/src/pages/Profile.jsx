import { useState } from 'react'
import { User, Mail, Lock, Save, Trash2, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { userService } from '../services/newsService'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

function Profile() {
  const { user, updateProfile, changePassword, logout } = useAuthStore()
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [loadingDelete, setLoadingDelete] = useState(false)
  
  const [errors, setErrors] = useState({})

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = {}
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!profileData.email) {
      newErrors.email = 'Email is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoadingProfile(true)
    try {
      await updateProfile(profileData)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoadingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = {}
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoadingPassword(true)
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword)
      toast.success('Password changed successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
      if (error.response?.status === 401) {
        setErrors({ currentPassword: 'Current password is incorrect' })
      }
    } finally {
      setLoadingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password to confirm')
      return
    }

    setLoadingDelete(true)
    try {
      await userService.deleteAccount(deletePassword)
      toast.success('Account deleted successfully')
      logout()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account')
    } finally {
      setLoadingDelete(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <User className="mr-3 h-8 w-8 text-primary-600" />
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your account information and security
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <Card.Header>
              <h2 className="font-semibold text-gray-900 flex items-center">
                <User className="mr-2 h-5 w-5 text-gray-400" />
                Personal Information
              </h2>
            </Card.Header>
            <Card.Body className="p-6">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  error={errors.name}
                />
                
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  icon={Mail}
                  value={profileData.email}
                  onChange={handleProfileChange}
                  error={errors.email}
                />

                <div className="flex justify-end">
                  <Button type="submit" loading={loadingProfile}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card.Body>
          </Card>

          {/* Change Password */}
          <Card>
            <Card.Header>
              <h2 className="font-semibold text-gray-900 flex items-center">
                <Lock className="mr-2 h-5 w-5 text-gray-400" />
                Change Password
              </h2>
            </Card.Header>
            <Card.Body className="p-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  icon={Lock}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  error={errors.currentPassword}
                />
                
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  icon={Lock}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  error={errors.newPassword}
                />
                
                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  icon={Lock}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  error={errors.confirmPassword}
                />

                <div className="flex justify-end">
                  <Button type="submit" loading={loadingPassword}>
                    <Lock className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              </form>
            </Card.Body>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <Card.Header className="bg-red-50">
              <h2 className="font-semibold text-red-700 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Danger Zone
              </h2>
            </Card.Header>
            <Card.Body className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Permanently delete your account and all data. This action cannot be undone.
                  </p>
                </div>
                <Button 
                  variant="danger" 
                  className="mt-4 sm:mt-0"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fade-in">
              <div className="flex items-center space-x-3 text-red-600 mb-4">
                <AlertTriangle className="h-8 w-8" />
                <h3 className="text-xl font-bold">Delete Account</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                This will permanently delete your account and all associated data including:
              </p>
              
              <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-1">
                <li>All classification history</li>
                <li>Saved explanations</li>
                <li>Account settings</li>
              </ul>
              
              <Input
                label="Enter your password to confirm"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
              />
              
              <div className="flex space-x-3 mt-6">
                <Button 
                  variant="secondary" 
                  fullWidth
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletePassword('')
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  fullWidth
                  loading={loadingDelete}
                  onClick={handleDeleteAccount}
                >
                  Delete Forever
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
