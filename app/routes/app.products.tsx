import { Card, Layout, Page, Box, Text, ResourceList, ResourceItem, Thumbnail } from "@shopify/polaris";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import { json, useLoaderData } from "@remix-run/react";
import { ProductIcon } from "@shopify/polaris-icons";

export const loader = async ({request}: LoaderFunctionArgs) => {
    const {admin} = await authenticate.admin(request)

    const response = admin.graphql(`
        #graphql
        query fetchProducts {
            products(first: 10) {
                edges {
                    node {
                        id
                        title
                        handle
                        featuredImage {
                            url
                            altText
                        }
                    }
                }
            }
        }
        `);
    
    const productsData = (await (await response).json()).data

    return json({
        products: productsData.products.edges
    })
}
export default function Products() {
 const { products } = useLoaderData<typeof loader>();

 const renderMedia = (image: any ) => {
  return image ? <Thumbnail source={image.url} alt={image.altText} /> 
    : <Thumbnail source={ProductIcon} alt="Product" />
 }

 const renderItem = (item: typeof products[number]) => {
  const {id, handle, title, url, featuredImage } = item.node;
  return (
    <ResourceItem id={id} url={url} media={renderMedia(featuredImage)}>
      <Text as="h5" variant="bodyMd"> {title}</Text>
      <div>{handle}</div>
    </ResourceItem>
  )
 }

   // Transform products into options for ComboBox
   const productOptions = products.map((product: any) => ({
    value: product.node.id,
    label: product.node.title,
  }));


  return (
    <Page>
      <ui-title-bar title="Products">
        <button variant="primary" onClick={() => {
            shopify.modal.show('create-product');
        }}>Create a product</button>
      </ui-title-bar>
      <ui-modal id="create-product">
        <ui-title-bar title="Create Product">
            <button variant="primary">OK</button>
        </ui-title-bar>
        <Box padding="500">
            Form to show
        </Box>
      </ui-modal>
      <Layout>
        <Layout.Section>
        <Card>
          <ResourceList resourceName={{
            singular: "Product",
            plural: "Products"
          }}
          items={products
           
          }
          renderItem={renderItem}></ResourceList>
        </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
