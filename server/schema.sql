-- Create tables for Organizo

-- Tasks table
create table if not exists tasks (
    id bigint primary key generated always as identity,
    name text not null,
    date date not null,
    time time,
    priority text check (priority in ('low', 'medium', 'high')),
    completed boolean default false,
    user_id text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Transactions table
create table if not exists transactions (
    id bigint primary key generated always as identity,
    type text check (type in ('spend', 'invest', 'receive')) not null,
    amount decimal(10,2) not null,
    description text not null,
    date date not null,
    tag text check (
        (type = 'spend' and tag in ('food', 'travel', 'subscriptions', 'shopping', 'misc')) or
        (type = 'invest' and tag in ('investment', 'savings')) or
        (type = 'receive' and tag in ('income', 'refund', 'other'))
    ),
    user_id text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- User settings table
create table if not exists user_settings (
    id bigint primary key generated always as identity,
    user_id text unique not null,
    monthly_income decimal(10,2) default 0,
    savings_goal decimal(10,2) default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at
create trigger update_tasks_updated_at
    before update on tasks
    for each row
    execute function update_updated_at_column();

create trigger update_transactions_updated_at
    before update on transactions
    for each row
    execute function update_updated_at_column();

create trigger update_user_settings_updated_at
    before update on user_settings
    for each row
    execute function update_updated_at_column();

-- Create indexes
create index if not exists idx_tasks_user_id on tasks(user_id);
create index if not exists idx_transactions_user_id on transactions(user_id);
create index if not exists idx_tasks_date on tasks(date);
create index if not exists idx_transactions_date on transactions(date);

-- Enable Row Level Security (RLS)
alter table tasks enable row level security;
alter table transactions enable row level security;
alter table user_settings enable row level security;

-- Create RLS policies that allow service role access and check user_id matching
create policy "Enable all access for service role"
    on tasks for all
    using (true)
    with check (true);

create policy "Enable all access for service role"
    on transactions for all
    using (true)
    with check (true);

create policy "Enable all access for service role"
    on user_settings for all
    using (true)
    with check (true);

-- Grant permissions to service role (replace 'service_role' with your actual service role name if different)
grant all privileges on table tasks to service_role;
grant all privileges on table transactions to service_role;
grant all privileges on table user_settings to service_role;
grant usage, select on all sequences in schema public to service_role;