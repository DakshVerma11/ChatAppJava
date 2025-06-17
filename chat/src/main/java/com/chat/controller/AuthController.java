package com.chat.controller;

import com.chat.entity.User;
import com.chat.service.UserService;
import jakarta.validation.Valid;

import java.util.Optional;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Landing page.
     */
    @GetMapping("/")
    public String home() {
        return "index";
    }

    /**
     * Show login form.  If user just registered, we can display a flash message.
     */
    @GetMapping("/login")
    public String login(
            @RequestParam(required = false) boolean registered,
            Model model
    ) {
        if (registered) {
            model.addAttribute("msg", "Registration successful! Please log in.");
        }
        return "login";
    }
    
    
    
    @PostMapping("/login")
    public String loginUser(
            @RequestParam("username") String usernameOrEmail,
            @RequestParam("password") String password,
            RedirectAttributes redirectAttrs,
            Model model
    ) {
    	// Debugging
    	
    	System.out.println(usernameOrEmail+"  "+password);
    	
    	model.addAttribute("msg", "MEOWWWWWWWWWWWWWWWWWWWWWWWWWWW.");
    	//
        Optional<User> userOpt = userService.authenticate(usernameOrEmail, password);

        if (userOpt.isPresent()) {
            return "redirect:/chat";
        } 
        
        else {
            // Login failure: show error on login page
            model.addAttribute("loginError", "Invalid username/email or password");
            return "login";
        }
    }
    
    
    /**
     * 
     * 
     * Display the registration form.
     */
    @GetMapping("/register")
    public String showRegistrationForm(Model model) {
        model.addAttribute("user", new User());
        return "register";
    }

    /**
     * Process the registration submission.
     * Performs basic validation and checks for duplicate usernames/emails.
     */
    @PostMapping("/register")
    public String registerUser(
            @Valid @ModelAttribute("user") User user,
            BindingResult bindingResult,
            RedirectAttributes redirectAttrs,
            Model model
    ) {
        // 1) Bean‐level validation errors?
        if (bindingResult.hasErrors()) {
            return "register";
        }

        // 2) Duplicate username/email?
        if (userService.existsByUsername(user.getUsername())) {
            model.addAttribute("usernameError", "Username already taken");
            return "register";
        }
        if (userService.existsByEmail(user.getEmail())) {
            model.addAttribute("emailError", "Email already registered");
            return "register";
        }

        // 3) All good → save user
        userService.register(user);

        // 4) Redirect to login with a flag so we can show a success msg
        redirectAttrs.addAttribute("registered", true);
        return "redirect:/login";
    }

    /**
     * Show forgot‐password form.
     */
    @GetMapping("/forgot-password")
    public String showForgotPasswordForm() {
        return "forgot-password";
    }

    /**
     * Handle forgot‐password submission.
     * (Stub—replace with real email/SMS logic.)
     */
    @PostMapping("/forgot-password")
    public String handleForgotPassword(
            @RequestParam("username") String username,
            RedirectAttributes redirectAttrs
    ) {
    	
        if (userService.existsByUsername(username) || userService.existsByEmail(username)) {
            // TODO: send reset link via email/SMS
            redirectAttrs.addFlashAttribute("msg",
                "If an account exists for “" + username + "”, a reset link has been sent.");
        } else {
            redirectAttrs.addFlashAttribute("msg",
                "If an account exists for “" + username + "”, a reset link has been sent.");
        }
        return "redirect:/forgot-password";
    }
    
    
    
}
