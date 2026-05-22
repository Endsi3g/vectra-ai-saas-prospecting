import { NextResponse } from 'next/server';

export function apiError(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function apiUnauthorized(message = 'Non autorisé'): NextResponse {
  return apiError(message, 401);
}

export function apiBadRequest(message = 'Requête invalide'): NextResponse {
  return apiError(message, 400);
}

export function apiNotFound(message = 'Ressource introuvable'): NextResponse {
  return apiError(message, 404);
}
