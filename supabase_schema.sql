-- Create public.workspaces table
CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on workspaces
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage workspaces they are part of"
    ON public.workspaces
    FOR ALL
    USING (true);

-- Create public.profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    business_type TEXT,
    preferred_languages TEXT[] DEFAULT '{}',
    tone TEXT CHECK (tone IN ('friendly', 'professional', 'formal')),
    onboarding_completed BOOLEAN DEFAULT false,
    tour_completed BOOLEAN DEFAULT false,
    google_connected BOOLEAN DEFAULT false,
    credits_count INTEGER DEFAULT 2000,
    credits_limit INTEGER DEFAULT 2000,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create collections table
CREATE TABLE public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own collections"
    ON public.collections
    FOR ALL
    USING (auth.uid() = user_id);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and edit their own profiles"
    ON public.profiles
    FOR ALL
    USING (auth.uid() = id);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (new.id);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Create campaigns table
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    business_type TEXT,
    offer TEXT,
    icp TEXT,
    angle TEXT,
    angle_description TEXT,
    call_to_action TEXT,
    extra_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own campaigns"
    ON public.campaigns
    FOR ALL
    USING (auth.uid() = user_id);


-- Create leads table
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    name TEXT,
    company TEXT,
    website TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage leads of their own campaigns"
    ON public.leads
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE public.campaigns.id = public.leads.campaign_id
              AND public.campaigns.user_id = auth.uid()
        )
    );


-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    language TEXT CHECK (language IN ('fr', 'en')),
    summary TEXT,
    email_subject TEXT,
    email_body TEXT,
    linkedin_message TEXT,
    personalization_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'discarded')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage messages of their own leads"
    ON public.messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.leads
            JOIN public.campaigns ON public.campaigns.id = public.leads.campaign_id
            WHERE public.leads.id = public.messages.lead_id
              AND public.campaigns.user_id = auth.uid()
        )
    );
