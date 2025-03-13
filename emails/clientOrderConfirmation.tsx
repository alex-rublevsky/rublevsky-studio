import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ClientOrderConfirmationProps {
  userImage?: string;
  Name?: string;
  LastName?: string;
  email?: string;
  orderId?: string;
  orderDate?: string;
  subtotal?: string;
  totalDiscount?: string;
  orderTotal?: string;
  orderStatus?: string;
  orderItems?: Array<{
    name: string;
    quantity: number;
    price: string;
    originalPrice: string;
    discount?: number;
    image?: string;
  }>;
}

export const ClientOrderConfirmation = ({
  Name,
  LastName,
  email,
  orderId,
  orderDate,
  subtotal,
  totalDiscount,
  orderTotal,
  orderStatus,
  orderItems = [],
}: ClientOrderConfirmationProps) => {
  const previewText = `Order Confirmation from Rublevsky Studio`;

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Preview>{previewText}</Preview>
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={
                  "https://assets.rublevsky.studio/logos/rublevsky-studio.svg"
                }
                width="40"
                height="37"
                alt="Rublevsky Studio"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Your order has been placed successfully!
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {Name} {LastName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              You will be contacted shortly regarding delivery and payment.
            </Text>

            <Section className="py-[16px] text-center">
              <Section className="my-[16px] rounded-[8px] border border-solid border-gray-200 p-[16px] pt-0">
                <table className="mb-[16px]" width="100%">
                  <tr>
                    <th className="border-0 border-b border-solid border-gray-200 py-[8px]">
                      &nbsp;
                    </th>
                    <th
                      align="left"
                      className="border-0 border-b border-solid border-gray-200 py-[8px] text-gray-500"
                      colSpan={6}
                    >
                      <Text className="font-semibold">Product</Text>
                    </th>
                    <th
                      align="center"
                      className="border-0 border-b border-solid border-gray-200 py-[8px] text-gray-500"
                    >
                      <Text className="font-semibold">Quantity</Text>
                    </th>
                    <th
                      align="center"
                      className="border-0 border-b border-solid border-gray-200 py-[8px] text-gray-500"
                    >
                      <Text className="font-semibold">Price</Text>
                    </th>
                  </tr>
                  {orderItems.map((item, index) => (
                    <tr key={index}>
                      <td className="border-0 border-b border-solid border-gray-200 py-[8px]">
                        {item.image ? (
                          <Img
                            alt={item.name}
                            className="rounded-[8px] object-cover"
                            height={110}
                            src={item.image}
                          />
                        ) : null}
                      </td>
                      <td
                        align="left"
                        className="border-0 border-b border-solid border-gray-200 py-[8px]"
                        colSpan={6}
                      >
                        <Text>{item.name}</Text>
                      </td>
                      <td
                        align="center"
                        className="border-0 border-b border-solid border-gray-200 py-[8px]"
                      >
                        <Text>{item.quantity}</Text>
                      </td>
                      <td
                        align="center"
                        className="border-0 border-b border-solid border-gray-200 py-[8px]"
                      >
                        <Text>CA${item.price}</Text>
                      </td>
                    </tr>
                  ))}
                </table>
                <Row>
                  <Column align="right" className="w-full px-[12px]">
                    <Text className="text-gray-600">
                      Subtotal: CA${subtotal}
                    </Text>
                    {Number(totalDiscount) > 0 && (
                      <Text className="text-red-600">
                        Discount: -CA${totalDiscount}
                      </Text>
                    )}
                    <Text className="font-semibold text-lg mt-2">
                      Total: CA${orderTotal}
                    </Text>
                  </Column>
                </Row>
                <Row>
                  <Column align="center">
                    <Button
                      className="box-border w-full rounded-[8px] bg-black px-[12px] py-[12px] text-center font-normal text-white"
                      href="https://rublevsky.studio/orders"
                    >
                      View Order
                    </Button>
                  </Column>
                </Row>
              </Section>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              or copy and paste this URL into your browser:{" "}
              <Link
                href={
                  "https://assets.rublevsky.studio/logos/rublevsky-studio.svg"
                }
                className="text-blue-600 no-underline"
              >
                {"https://assets.rublevsky.studio/logos/rublevsky-studio.svg"}
              </Link>
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This invitation was intended for{" "}
              <span className="text-black">{Name}</span>. This invite was sent
              from <span className="text-black"></span> located in{" "}
              <span className="text-black"></span>. If you were not expecting
              this invitation, you can ignore this email. If you are concerned
              about your account's safety, please reply to this email to get in
              touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

ClientOrderConfirmation.PreviewProps = {
  username: "alanturing",
  Name: "Alan",
  LastName: "Turing",
  email: "alan.turing@example.com",
  orderId: "1234567890",
  orderDate: "2024-01-01",
  subtotal: "$100.00",
  totalDiscount: "$10.00",
  orderTotal: "$90.00",
  orderStatus: "Pending",
  orderItems: [
    {
      name: "Sample Product",
      quantity: 1,
      price: "100.00",
      originalPrice: "100.00",
      discount: 10,
      image: "https://example.com/sample.jpg",
    },
  ],
} as ClientOrderConfirmationProps;

export default ClientOrderConfirmation;
