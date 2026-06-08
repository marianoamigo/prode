package com.prode.worldcup.controllers;

import com.prode.worldcup.domain.dtos.request.MatchResultRequestDTO;
import com.prode.worldcup.domain.dtos.response.MatchResponseDTO;
import com.prode.worldcup.services.matches.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService matchService;

    @GetMapping("/all")
    public List<MatchResponseDTO> findAll() {
        return matchService.findAll();
    }

    @PostMapping("/result")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateResult(@RequestBody MatchResultRequestDTO request){
        matchService.updateResult(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/date/{date}")
    public List<MatchResponseDTO> getMatchesByDate(
            @PathVariable LocalDate date
    ){
        return matchService.getMatchesByDate(
                date
        );
    }
}
