import { useState, useEffect } from 'react';
import { FileText, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaseStatsCards } from '@/components/dashboard/LeaseStatsCards';

import { LeaseContractDialog } from '@/components/dialogs/LeaseContractDialog';
import { LeaseContractsList } from '@/components/dashboard/LeaseContractsList';
import { leaseContractsService } from '@/services/lease-contracts.service';
import { leasePDFService } from '@/services/lease-pdf.service';
import { CreateLeaseInput, RenewLeaseInput, TerminateLeaseInput, LeaseContract } from '@/types/lease-contract';
import PageHeader from '@/components/layout/PageHeader';

// Mock data for properties and tenants
const mockProperties = [
  { id: 'prop-1', address: 'Rue 12, Cité Biagui', type: 'Appartement', surface: 75, rooms: 3 },
  { id: 'prop-2', address: 'Avenue Cheikh Anta Diop', type: 'Maison', surface: 120, rooms: 4 },
  { id: 'prop-3', address: 'Zone de Captage', type: 'Studio', surface: 35, rooms: 1 },
];

const mockTenants = [
  { id: 'tenant-1', fullName: 'Mamadou Diop', email: 'mamadou@email.com', phone: '77 123 45 67' },
  { id: 'tenant-2', fullName: 'Fatou Sall', email: 'fatou@email.com', phone: '78 987 65 43' },
  { id: 'tenant-3', fullName: 'Alioune Ndiaye', email: 'alioune@email.com', phone: '70 555 44 33' },
];

export function LeaseContracts() {
  const [contracts, setContracts] = useState<LeaseContract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Load contracts from storage
    const storedContracts = leaseContractsService.getAll();
    setContracts(storedContracts);
  }, []);

  const handleCreate = (input: CreateLeaseInput) => {
    const property = mockProperties.find(p => p.id === input.propertyId);
    const tenants = mockTenants.filter(t => input.tenantIds.includes(t.id));
    
    if (!property) {
      console.error('Propriété non trouvée');
      return;
    }

    const newContract = leaseContractsService.create(input, property, tenants);
    setContracts([...contracts, newContract]);

    // Generate PDF
    leasePDFService.generateContractPDF(newContract);
  };

  const handleRenew = (input: RenewLeaseInput) => {
    const originalContract = contracts.find(c => c.id === input.contractId);
    if (!originalContract) return;

    const renewedContract = leaseContractsService.renew(input, originalContract);
    setContracts([...contracts, renewedContract]);

    // Generate renewal PDF
    leasePDFService.generateContractRenewalPDF(originalContract, renewedContract, input.newStartDate || originalContract.endDate);
  };

  const handleTerminate = (input: TerminateLeaseInput) => {
    const terminatedContract = leaseContractsService.terminate(input);
    setContracts(contracts.map(c => 
      c.id === input.contractId ? terminatedContract : c
    ));
  };

  const handleEdit = (contract: LeaseContract) => {
    // For now, just log - could open edit dialog
    console.log('Edit contract:', contract);
  };

  const handleDelete = (contractId: string) => {
    leaseContractsService.delete(contractId);
    setContracts(contracts.filter(c => c.id !== contractId));
  };

  // Filter contracts
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.tenants.some(t => t.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      contract.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: contracts.length,
    actif: contracts.filter(c => c.status === 'actif').length,
    expire: contracts.filter(c => c.status === 'expire').length,
    resilie: contracts.filter(c => c.status === 'resilie').length,
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Contrats de bail"
        icon={FileText}
        description="Gérez vos contrats de bail et renouvellements"
        action={
          <LeaseContractDialog
            onSave={handleCreate}
            properties={mockProperties}
            tenants={mockTenants}
          >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Contrat
            </Button>
          </LeaseContractDialog>
        }
      >
        Contrats de bail
      </PageHeader>

      <LeaseStatsCards
        cards={[
          {
            title: 'Total Contrats',
            value: stats.total,
            icon: FileText,
          },
          {
            title: 'Actifs',
            value: stats.actif,
            icon: FileText,
          },
          {
            title: 'Expirés',
            value: stats.expire,
            icon: FileText,
          },
          {
            title: 'Résiliés',
            value: stats.resilie,
            icon: FileText,
          },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Liste des Contrats</CardTitle>
          <CardDescription>
            Consultez et gérez tous vos contrats de bail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">Rechercher</Label>
              <Input
                id="search"
                placeholder="Rechercher par adresse, locataire, référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48 space-y-2">
              <Label>Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="expire">Expiré</SelectItem>
                  <SelectItem value="renouvele">Renouvelé</SelectItem>
                  <SelectItem value="resilie">Résilié</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="classique">Bail Classique</TabsTrigger>
              <TabsTrigger value="colocation">Colocation</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <LeaseContractsList
                contracts={filteredContracts}
                onRenew={handleRenew}
                onTerminate={handleTerminate}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </TabsContent>
            <TabsContent value="classique" className="mt-4">
              <LeaseContractsList
                contracts={filteredContracts.filter(c => c.type === 'classique')}
                onRenew={handleRenew}
                onTerminate={handleTerminate}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </TabsContent>
            <TabsContent value="colocation" className="mt-4">
              <LeaseContractsList
                contracts={filteredContracts.filter(c => c.type === 'colocation')}
                onRenew={handleRenew}
                onTerminate={handleTerminate}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
