package com.chat.config;

import com.chat.service.ChatUserDetailsService;
import com.chat.service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;


@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final ChatUserDetailsService chatUserDetailsService;

    public SecurityConfig(ChatUserDetailsService chatUserDetailsService) {
        this.chatUserDetailsService = chatUserDetailsService;
    }
/*
public class SecurityConfig {
    private final UserService userService;
    private final ChatUserDetailsService chatUserDetailsService;

    public SecurityConfig(UserService userService, ChatUserDetailsService chatUserDetailsService) {
        this.userService = userService;
        this.chatUserDetailsService = chatUserDetailsService;
    }
    
    public UserService getUserService() {
        return userService;
    }
*/
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
          .csrf(csrf -> csrf.disable())
          .authorizeHttpRequests(auth -> auth
              .requestMatchers(
                  "/",                // home/index
                  "/login",           // login form
                  "/register",        // registration form
                  "/forgot-password", // forgot-password form
                  "/css/**", "/js/**" // static assets
              ).permitAll()
              .anyRequest().authenticated()
          )
          .userDetailsService(chatUserDetailsService)
          .formLogin(form -> form
              .loginPage("/login")
              .usernameParameter("username") 
              .passwordParameter("password") 
              .defaultSuccessUrl("/chat", true)
              .failureUrl("/login?error")
              .permitAll()
          )
          .logout(logout -> logout
              .logoutUrl("/logout")
              .logoutSuccessUrl("/login?logout")
          );

        return http.build();
    }
    
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    

    
}