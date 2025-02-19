create table scopes (
  id varchar(21) not null,
  resource_id varchar(21) not null references resources (id) on update cascade on delete cascade,
  name varchar(256) not null,
  description text not null,
  created_at timestamptz not null default(now()),
  primary key (id)
);

create index scopes__resource_id_name
on scopes (
  resource_id,
  name
);
