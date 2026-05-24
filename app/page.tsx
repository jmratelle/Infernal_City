import PageClient from './page-client';

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const createParam = params?.create;
  const initialIsCreating = Array.isArray(createParam)
    ? createParam.includes('1')
    : createParam === '1';

  return <PageClient initialIsCreating={initialIsCreating} />;
}
