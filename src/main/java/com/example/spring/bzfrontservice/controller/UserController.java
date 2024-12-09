package com.example.spring.bzfrontservice.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/webs")
public class UserController {
    @GetMapping("/signin")
    public String login() {
        return "signin";
    }

    @GetMapping("/loginSuccess")
    public String home(){
        return "home";
    }

    @GetMapping("/join")
    public String join(@RequestParam String email, @RequestParam String provider, @RequestParam String role, Model model){
        model.addAttribute("email", email);
        model.addAttribute("provider", provider);
        model.addAttribute("role", role);

        return "join";
    }

    @GetMapping("/fail")
    public String fail(){
        return "fail";
    }
}
