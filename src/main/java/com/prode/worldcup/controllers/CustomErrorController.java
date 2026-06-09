package com.prode.worldcup.controllers;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        Object statusObj = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        if (statusObj != null) {
            int status = Integer.parseInt(statusObj.toString());
            if (status == HttpStatus.NOT_FOUND.value()) {
                return "redirect:/error.html?status=404";
            } else if (status == HttpStatus.FORBIDDEN.value()) {
                return "redirect:/error.html?status=403";
            } else if (status == HttpStatus.INTERNAL_SERVER_ERROR.value()) {
                return "redirect:/error.html?status=500";
            }
        }
        return "redirect:/error.html";
    }
}