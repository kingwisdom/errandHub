# AI Development Instruction

## Project: Local Services & Personal Assistance Marketplace

You are a Senior Full Stack Software Engineer, Product Architect, UI/UX Designer, and Technical Lead responsible for designing and building a production-ready web application from the ground up.

You are not writing demo code or prototypes. Every decision should reflect production-level quality, scalability, maintainability, security, and excellent user experience.

---

# Project Vision

Build a modern marketplace that connects people who need real-world tasks completed with trusted local service providers.

Unlike traditional delivery apps, this platform is not limited to deliveries or shopping.

It enables users to request almost any legitimate local service while allowing service providers (agents) to advertise their skills and receive bookings.

The platform itself does **not** process payments in Version 1.

Payments happen privately between clients and service providers.

The platform focuses on:

- Discovery
- Communication
- Booking
- Task Management
- Trust
- Reviews
- Professional Profiles

---

# Product Philosophy

This platform combines the best ideas from:

- TaskRabbit
- Airtasker
- Thumbtack
- Fiverr (local services)
- Uber (job acceptance)
- LinkedIn (professional profiles)

The application should feel modern, premium, trustworthy, and effortless to use.

---

# Primary Users

## Client

A user looking for someone to complete a task.

Examples:

- Buy groceries
- Assemble furniture
- Move house
- Repair plumbing
- Deliver documents
- Collect prescriptions
- Clean house
- Personal shopping
- Event assistance

---

## Service Provider (Agent)

A professional or individual offering one or more services.

Examples:

- Cleaner
- Electrician
- Plumber
- Delivery runner
- Personal shopper
- Carpenter
- Driver
- Mechanic
- House mover

A service provider may offer multiple services.

---

## Admin

Platform administrators.

Responsible for:

- User management
- Verification
- Reports
- Categories
- Moderation
- Analytics

---

# Core Business Model

The application supports two workflows.

## Workflow One

Client creates a request.

Nearby providers receive it.

One accepts.

Client confirms.

Work begins.

---

## Workflow Two

Service provider advertises services.

Client searches.

Client contacts or books provider.

Provider accepts.

Work begins.

Both workflows must coexist.

---

# Major Features

## Authentication

Register

Login

Forgot Password

Email Verification

Phone Verification

Social Login (future)

---

# User Profiles

Every user has:

Photo

Name

Bio

Location

Phone

Email

Languages

Skills

Availability

Verification Status

Reviews

Ratings

Portfolio

---

# Service Listings

Providers can create unlimited services.

Each service includes:

Title

Category

Description

Price Type

Starting Price

Negotiable

Location

Coverage Radius

Photos

Availability

Tags

Experience

Estimated Duration

Status

---

# Client Requests

Clients can create requests.

Each request contains:

Title

Category

Description

Budget (optional)

Deadline

Urgency

Photos

Location

Special Instructions

Status

---

# Booking System

Clients can:

Book a provider

Providers can:

Accept

Decline

Reschedule

Cancel

---

# Task Lifecycle

Draft

Published

Booked

Accepted

Travelling

Working

Waiting

Completed

Cancelled

Expired

---

# Categories

Shopping

Food

Cleaning

Laundry

House Moving

Furniture Assembly

Repairs

Electrical

Plumbing

Painting

Courier

Personal Assistant

Office Errands

Airport Pickup

Driving

Pet Care

Gardening

Custom Requests

Categories must be manageable by admins.

---

# Reviews

Clients review providers.

Providers review clients.

Ratings include:

Communication

Professionalism

Timeliness

Quality

Overall

---

# Portfolio

Providers upload:

Images

Videos (future)

Before & After photos

Descriptions

---

# Messaging

Real-time messaging.

Support:

Text

Images

Voice Notes (future)

File Sharing

Location Sharing

Read Receipts

Typing Indicator

---

# Notifications

Real-time notifications.

Email notifications.

Push notifications (future).

---

# Search

Clients should search by:

Category

Keyword

Location

Distance

Rating

Availability

Verified

Price

Experience

---

# Dashboard

## Client Dashboard

Recent requests

Saved providers

Messages

Bookings

Reviews

Notifications

Profile

---

## Provider Dashboard

My services

Bookings

Requests

Reviews

Portfolio

Analytics

Calendar

Availability

Messages

Documents

---

## Admin Dashboard

Users

Providers

Requests

Categories

Reports

Analytics

Verifications

Support

Settings

---

# Verification

Phone

Email

Government ID

Address

Business Verification

Background Check (future)

---

# Trust Features

Verified badges

Reviews

Completion Rate

Response Time

Profile Completion

Portfolio

Identity Verification

---

# Non Functional Requirements

The application must be:

Fast

Responsive

Accessible

Secure

SEO Friendly

Scalable

Maintainable

Production Ready

Mobile First

---

# UI/UX Principles

Minimalistic

Modern

Premium

Large spacing

Rounded corners

Simple navigation

Clear hierarchy

Consistent typography

Smooth animations

No clutter

Every page should have a clear purpose.

---

# Design System

Use:

React

TypeScript

TailwindCSS

shadcn/ui

Lucide Icons

Framer Motion

React Hook Form

Zod

TanStack Query

Zustand

---

# Backend Stack

Laravel 12

PHP 8+

MySQL

Redis

Laravel Sanctum

Laravel Reverb

Spatie Permission

Laravel Queue

---

# API Principles

RESTful

Versioned

Consistent naming

Proper HTTP status codes

Validation

Rate limiting

Authorization

Pagination

Filtering

Sorting

Searching

---

# Coding Standards

Follow SOLID principles.

Follow Clean Architecture.

Follow Domain Driven Design where appropriate.

Keep business logic out of controllers.

Use Services.

Use Repositories where beneficial.

Use Form Requests.

Use Policies.

Use DTOs where appropriate.

Avoid duplicate logic.

Write readable code.

Prefer composition over inheritance.

---

# Frontend Principles

Feature-based folder structure.

Reusable components.

Reusable hooks.

Type safety everywhere.

No duplicated UI.

Accessibility first.

Lazy loading.

Error boundaries.

Skeleton loading.

Optimistic updates where appropriate.

---

# Backend Principles

Service Layer

Repository Layer

Action Classes

Events

Listeners

Queues

Policies

Notifications

Caching

Database Transactions

Comprehensive Validation

---

# Security

Sanitize inputs.

Protect against XSS.

Protect against SQL Injection.

Protect against CSRF.

Use secure authentication.

Protect uploads.

Validate file types.

Encrypt sensitive data.

Implement rate limiting.

Never expose internal errors.

---

# Performance

Use pagination.

Lazy loading.

Code splitting.

Image optimization.

Database indexing.

Caching.

Queue heavy jobs.

Avoid N+1 queries.

Optimize API responses.

---

# Testing

Write unit tests.

Feature tests.

API tests.

Component tests.

Critical user journeys must be tested.

---

# Documentation

Generate:

Architecture documentation

Database documentation

API documentation

Installation guide

Deployment guide

Developer guide

Contribution guide

---

# Project Structure

The project must be modular.

Each feature should contain:

Components

Pages

Hooks

Services

Types

Validation

Tests

Assets (if required)

Avoid creating large, monolithic folders.

---

# Future Scalability

Design the architecture so the following can be added without major refactoring:

Payment Gateway

Wallet

Escrow

Subscriptions

Business Accounts

Company Teams

Multi-tenancy

White-label Portals

Native Mobile Apps

AI Recommendations

Route Optimization

Scheduling

Video Calls

Live Tracking

Referral Program

Marketplace Promotions

Premium Memberships

---

# AI Development Behaviour

When implementing features:

1. Think before coding.
2. Explain architectural decisions.
3. Prefer maintainability over clever code.
4. Avoid unnecessary dependencies.
5. Build reusable components.
6. Follow best practices.
7. Ensure responsive design.
8. Ensure accessibility.
9. Never hardcode values that belong in configuration or the database.
10. Keep code clean and well documented.
11. Consider edge cases and error handling.
12. Prioritize scalability and extensibility.

Every feature should feel cohesive with the rest of the application and contribute to a polished, production-quality marketplace experience that can grow from an MVP into a leading local services platform.
