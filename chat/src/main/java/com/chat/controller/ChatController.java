package com.chat.controller;

import com.chat.entity.User;
import com.chat.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class ChatController {

    private final UserService userService;

    public ChatController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/chat")
    public String chatPage(@AuthenticationPrincipal org.springframework.security.core.userdetails.User u, Model m) {
        User user = userService.findByUsername(u.getUsername()).orElseThrow();
        m.addAttribute("username", user.getUsername());
        m.addAttribute("userId", user.getUserId());
        m.addAttribute("friends", userService.getFriends(user.getUserId()));
        return "chat";
    }
}