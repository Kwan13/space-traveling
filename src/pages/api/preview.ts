/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { NextApiRequest, NextApiResponse } from 'next';
import { getPrismicClient as PrismicClient } from '../../services/prismic';

function linkResolver(doc) {
  if (doc.type === 'post') {
    return `/post/${doc.uid}`;
  }

  return `/${doc.uid}`;
}

export default async function preview(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { token: ref, documentId } = req.query;

  const url = await PrismicClient(req)
    .getPreviewResolver(String(ref), String(documentId))
    .resolve(linkResolver, '/');

  if (!url) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.setPreviewData({
    ref,
  });

  res.write(
    `<!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0; url=${url}" />
    <script>window.location.href = '${url}'</script>
    </head>`
  );

  res.end();
}
