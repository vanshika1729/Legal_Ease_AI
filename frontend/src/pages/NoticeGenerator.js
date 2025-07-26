import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const noticeTypes = [
  { value: 'rent', label: 'Rent Dispute' },
  { value: 'salary', label: 'Salary Complaint' },
  { value: 'consumer', label: 'Consumer Grievance' },
  { value: 'other', label: 'Other (Describe your issue)' },
];

const stepVariants = {
  hidden: { opacity: 0, x: 200 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -200 },
};

const NoticeGenerator = () => {
  const [step, setStep] = useState(1);
  const [noticeType, setNoticeType] = useState('');
  const [formData, setFormData] = useState({});
  const [customIssue, setCustomIssue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login');
  }, [navigate]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const handleTypeChange = (e) => setNoticeType(e.target.value);
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleCustomIssueChange = (e) => setCustomIssue(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    let details = formData.details;
    let type = noticeType;
    if (noticeType === 'other') {
      details = customIssue;
      type = 'other';
    }
    try {
      const res = await fetch('http://127.0.0.1:8000/generate_notice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({
          notice_type: type,
          name: formData.name,
          recipient: '',
          details,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate notice');
      const data = await res.json();
      navigate('/result', { state: { noticeType: type, formData: { ...formData, customIssue }, notice: data.notice } });
    } catch (err) {
      setIsGenerating(false);
      alert('Failed to generate notice. Please try again.');
    }
  };


  return (
    <div className="notice-generator">
      <h2>Generate a Legal Notice</h2>
      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
        
              <motion.label variants={stepVariants}>
                Select Notice Type:
              </motion.label>

              <motion.div className="select-wrapper" variants={stepVariants}>
                <select value={noticeType} onChange={handleTypeChange} required>
                  <option value="">-- Select --</option>
                  {noticeTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </motion.div>
                
              <motion.button
                type="button"
                onClick={handleNext}
                disabled={!noticeType}
                className="secondary-btn"
                variants={stepVariants}
              >
                Next
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.label variants={stepVariants}>Enter Details:</motion.label>
              
              
              <motion.input 
                type="text" 
                name="name" 
                placeholder="Your Name" 
                onChange={handleInputChange} 
                required 
                disabled={isGenerating} 
                variants={stepVariants} 
              />
          
              {noticeType === 'other' ? (
                <motion.textarea
                  name="customIssue"
                  placeholder="Describe your issue in detail"
                  value={customIssue}
                  onChange={handleCustomIssueChange}
                  required
                  disabled={isGenerating}
                  variants={stepVariants}
                />
              ) : (
                <motion.textarea
                  name="details"
                  placeholder="Describe your issue"
                  onChange={handleInputChange}
                  required
                  disabled={isGenerating}
                  variants={stepVariants}
                />
              )}
          
              <div style={{display: 'flex', gap: '1rem'}}>
                
                <motion.button 
                  type="button" 
                  onClick={handleBack} 
                  disabled={isGenerating} 
                  className="secondary-btn" 
                  variants={stepVariants}
                >
                  Back
                </motion.button>
               
                <motion.button 
                  type="submit" 
                  disabled={isGenerating} 
                  className="secondary-btn" 
                  variants={stepVariants}
                >
                  {isGenerating && <div className="spinner"></div>}
                  {isGenerating ? 'Generating...' : 'Generate Notice'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default NoticeGenerator;