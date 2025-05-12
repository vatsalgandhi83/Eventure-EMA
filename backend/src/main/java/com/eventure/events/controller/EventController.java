package com.eventure.events.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.eventure.events.Services.EventServices;
import com.eventure.events.model.Events;
import com.eventure.events.dto.EventUpdateRequest;
import com.eventure.events.dto.EventByUserResponse;

@RestController
@RequestMapping(value = "/api/events")
public class EventController {

    @Autowired
    private EventServices eventService;

    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping("/createEvent")
    public ResponseEntity<Events> createEvent(@RequestBody Events event) {
        Events created = eventService.createEvent(event);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public List<Events> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/{event_id}")
    public ResponseEntity<Events> getEventById(@PathVariable String event_id) {
        Optional<Events> event = eventService.getEventById(event_id);
        return event.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/byUser")
    public ResponseEntity<List<EventByUserResponse>> getEventsByUserId(@RequestParam String userId) {        
        List<EventByUserResponse> userEvents = eventService.getEventsByUserId(userId);
        return ResponseEntity.ok(userEvents);
    }

    @GetMapping("/byorganizer")
    public ResponseEntity<List<Events>> getOrganizerEventsList(@RequestParam String organizerId) {
        List<Events> organizerEventsList = eventService.getOrganizerEventsList(organizerId);
        return ResponseEntity.ok(organizerEventsList);
    }

    @PutMapping("/{event_id}")
    public ResponseEntity<Events> updateEvent(@PathVariable String event_id, @RequestBody EventUpdateRequest updateRequest, @RequestParam String userId) {
        Events updated = eventService.updateEvent(event_id, updateRequest, userId);
        return ResponseEntity.ok(updated);
    }
}
