import { Layout, Menu } from "antd";
const { Header, Sider, Content } = Layout;

export default function Dashboard() {
  return (
    <Layout className="min-h-screen">
      <Sider collapsible>
        <Menu theme="dark" items={[{ key: '1', label: 'Bãi đỗ' }]} />
      </Sider>
      <Layout>
        <Header className="bg-white shadow-md">Dashboard</Header>
        <Content className="p-6 bg-gray-100">Nội dung ở đây</Content>
      </Layout>
    </Layout>
  );
}
