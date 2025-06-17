package com.chat.controller;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import com.chat.entity.User;

@Controller
public class ChatController {
    @GetMapping("/chat")
    public String chatPage(@AuthenticationPrincipal org.springframework.security.core.userdetails.User u, Model m) {
        m.addAttribute("username", u.getUsername());
        return "chat";
    }
    

}