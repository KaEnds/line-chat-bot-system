export default async function TestPage({params}: {params: {slug: string}}) {
  const slug = await params.slug;
  return <div> slug: { slug }</div>;
}