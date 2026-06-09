package com.prode.worldcup.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class PageController {

    @GetMapping("/pages/{page:[a-zA-Z0-9-]+}")
    public String page(@PathVariable String page) {
        return "forward:/pages/" + page + ".html";
    }
}