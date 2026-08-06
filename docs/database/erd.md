# Organization

## Purpose

Represents a customer institution using the SaaS platform.

---

## Relationships

Organization
├── has one OrganizationSettings
├── has many Branches
├── has many Users
├── has many Courses
├── has many Announcements

---

## Fields

id (UUID)

code

name

slug

email

phone

logo

status

createdAt

updatedAt

deletedAt

createdBy

updatedBy