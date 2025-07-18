import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { gql, useLazyQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

// Correctly structured GraphQL Query
const GET_USER_BY_TOKEN = gql`
  query GetUserByToken($idToken: String!) {
    userByToken(idToken: $idToken) {
      id
      googleId
      name
      email
      department
      preferredHomepage
      token
    }
  }
`;

const LoginPage: React.FC = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const [getUser] = useLazyQuery(GET_USER_BY_TOKEN, {
    onCompleted: (data) => {
      if (data?.userByToken) {
        localStorage.setItem('authToken', data.userByToken.token);
        googleLogin(data.userByToken);
        if (!data.userByToken.department) {
          navigate('/profile-setup');
        } else {

          navigate(data.userByToken.preferredHomepage || '/');

          const validHome = ['/orders', '/product-dev', '/costing', '/production', '/inventory', '/'].includes(data.userByToken.preferredHomepage)
            ? data.userByToken.preferredHomepage
            : '/';
          navigate(validHome);

        }
      }
    },
    onError: (error) => {
      console.error('GraphQL Error during login:', error.message);
    },
  });
  

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    console.log('Google Response:', credentialResponse);
    if (credentialResponse.credential) {
      // The 'credential' field is the ID Token.
      // We send it with the correct variable name 'idToken'.
      getUser({ variables: { idToken: credentialResponse.credential } });
    } else {
      console.error('Google login failed: No credential returned.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Welcome Back</h1>
        <p className="text-gray-600 mb-6">Sign in to continue to Apparel-flow</p>
        <div className="flex justify-center">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                    console.error('Google Login Failed');
                }}
                useOneTap
            />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;