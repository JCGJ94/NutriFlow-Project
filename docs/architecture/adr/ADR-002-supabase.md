# ADR-002: Supabase as Backend-as-a-Service

**Status:** Accepted  
**Date:** 2026-01-15  
**Decision by:** Development Team

## Context

NutriFlow needs:
- User authentication
- PostgreSQL database
- Row-level security for multi-tenant data
- Scalable infrastructure for MVP

## Decision

Use **Supabase Cloud** as the primary database and authentication provider.

### Rationale

1. **PostgreSQL**: Full SQL capabilities with extensions
2. **Built-in Auth**: Email/password authentication out-of-box
3. **RLS Policies**: Native row-level security at database level
4. **Free Tier**: Sufficient for MVP development
5. **Real-time**: WebSocket subscriptions if needed later

## Implementation

### Authentication Flow

```
User → Supabase Auth → JWT Token → NestJS Validation → API Access
```

### Database Security

All tables use RLS policies:
```sql
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| Firebase | Google ecosystem | NoSQL limitations |
| Auth0 + Postgres | Enterprise auth | Multiple services to manage |
| Self-hosted | Full control | Infrastructure overhead |

## Consequences

### Positive
- Rapid development with managed services
- Secure by default with RLS
- No infrastructure management needed

### Negative
- Vendor lock-in for auth
- Limited to PostgreSQL
- Supabase-specific JWT handling

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
