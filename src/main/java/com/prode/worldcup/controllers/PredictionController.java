package com.prode.worldcup.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/predictions")
public class PredictionController {

    @GetMapping(value = "/v1/allmatches")
    public ResponseEntity<?> getAllMatches (/* params */) {
        return ResponseEntity.ok("Partidos");
    }
}
