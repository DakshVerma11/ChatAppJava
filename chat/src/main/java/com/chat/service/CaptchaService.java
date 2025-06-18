package com.chat.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class CaptchaService {
    
    private static final String SECRET_KEY = "6LcT5l0rAAAAAG8_vy9qx_z9pM2Rkx4KZak81Vg-";
    private static final String VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public CaptchaService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    public boolean verifyCaptcha(String captchaResponse) {
        if (captchaResponse == null || captchaResponse.trim().isEmpty()) {
            return false;
        }
        
        try {
            // Prepare request headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            // Prepare request body
            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("secret", SECRET_KEY);
            map.add("response", captchaResponse);
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
            
            // Make request to Google
            ResponseEntity<String> response = restTemplate.postForEntity(VERIFY_URL, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                CaptchaResponse captchaResp = objectMapper.readValue(response.getBody(), CaptchaResponse.class);
                return captchaResp.isSuccess();
            }
            
        } catch (Exception e) {
            System.err.println("Error verifying CAPTCHA: " + e.getMessage());
        }
        
        return false;
    }
    
    // Inner class for CAPTCHA response
    public static class CaptchaResponse {
        @JsonProperty("success")
        private boolean success;
        
        @JsonProperty("error-codes")
        private String[] errorCodes;
        
        public boolean isSuccess() {
            return success;
        }
        
        public void setSuccess(boolean success) {
            this.success = success;
        }
        
        public String[] getErrorCodes() {
            return errorCodes;
        }
        
        public void setErrorCodes(String[] errorCodes) {
            this.errorCodes = errorCodes;
        }
    }
}