import React, { useState, useEffect, useRef } from 'react';

const FaceRecognitionMonitor = ({ onSecurityAlert, isActive }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, verified, failed
  const streamRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraReady(true);
        
        // Start face detection simulation
        detectFaces();
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      onSecurityAlert('camera_blocked', 'Camera access is required for exam security');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  };

  const detectFaces = () => {
    // Simulated face detection (in production, use MediaPipe Face Mesh)
    const interval = setInterval(() => {
      // Random simulation - in real implementation, this would use MediaPipe
      const detectedFaces = Math.random() > 0.3 ? 1 : Math.random() > 0.7 ? 2 : 0;
      setFaceCount(detectedFaces);
      setFaceDetected(detectedFaces === 1);

      if (detectedFaces === 0) {
        onSecurityAlert('no_face', 'No face detected - student may have left');
        setVerificationStatus('failed');
      } else if (detectedFaces > 1) {
        onSecurityAlert('multiple_faces', 'Multiple faces detected - possible cheating');
        setVerificationStatus('failed');
      } else {
        setVerificationStatus('verified');
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  return (
    <div className="glass-strong rounded-2xl p-4 border-2 border-gold/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <i className="fas fa-user-shield text-gold"></i>
          Face Recognition
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          verificationStatus === 'verified' 
            ? 'bg-green-600 text-white' 
            : verificationStatus === 'failed'
            ? 'bg-red-600 text-white'
            : 'bg-yellow-600 text-white'
        }`}>
          {verificationStatus === 'verified' ? '✓ Verified' : 
           verificationStatus === 'failed' ? '⚠ Alert' : 
           '◷ Verifying...'}
        </div>
      </div>

      {/* Camera Feed */}
      <div className="relative rounded-xl overflow-hidden bg-black mb-3">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-48 object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Face Detection Overlay */}
        {cameraReady && faceDetected && (
          <div className="absolute inset-0 border-4 border-green-500 animate-pulse">
            <div className="absolute top-2 left-2 bg-green-500 px-2 py-1 rounded text-xs font-bold">
              FACE DETECTED
            </div>
          </div>
        )}

        {/* Multiple Face Warning */}
        {faceCount > 1 && (
          <div className="absolute inset-0 border-4 border-red-500 animate-pulse">
            <div className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded text-xs font-bold">
              ⚠ {faceCount} FACES DETECTED
            </div>
          </div>
        )}

        {/* No Face Warning */}
        {faceCount === 0 && cameraReady && (
          <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-2"></i>
              <p className="text-white font-bold">No Face Detected</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="glass p-2 rounded-lg">
          <span className="text-gray-400">Camera:</span>
          <span className={`ml-2 font-bold ${cameraReady ? 'text-green-400' : 'text-red-400'}`}>
            {cameraReady ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="glass p-2 rounded-lg">
          <span className="text-gray-400">Faces:</span>
          <span className={`ml-2 font-bold ${
            faceCount === 1 ? 'text-green-400' : 'text-red-400'
          }`}>
            {faceCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FaceRecognitionMonitor;
